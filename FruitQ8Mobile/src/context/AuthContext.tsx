import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithEmail, registerWithEmail, logoutUser, getUserData } from '../services/firebase';
import { changeLanguage } from '../utils/i18n';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  role?: 'admin' | 'delivery' | 'user' | string;
  language?: 'ar' | 'en' | 'bn' | string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  canAccessAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const saved = await AsyncStorage.getItem('user');
      if (!saved) {
        return;
      }

      const parsedUser = JSON.parse(saved) as User;
      const userId = parsedUser.id || await AsyncStorage.getItem('@user_id');

      if (!userId) {
        setUser(parsedUser);
        return;
      }

      try {
        const latestUserData = await getUserData(userId);
        if (latestUserData) {
          const refreshedUser: User = {
            ...parsedUser,
            id: userId,
            name: latestUserData.name || parsedUser.name,
            email: latestUserData.email || parsedUser.email,
            phone: latestUserData.phone || parsedUser.phone,
            isAdmin: Boolean(latestUserData.isAdmin || latestUserData.role === 'admin'),
            role: latestUserData.role || parsedUser.role,
            language: latestUserData.language || parsedUser.language,
          };

          await saveUser(refreshedUser);
          return;
        }
      } catch (refreshError) {
        console.error('Error refreshing user profile:', refreshError);
      }

      setUser(parsedUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('@user_id', userData.id); // حفظ user_id بشكل منفصل

      const preferredLanguage = typeof userData.language === 'string' ? userData.language.trim().toLowerCase() : '';
      if (preferredLanguage === 'ar' || preferredLanguage === 'en' || preferredLanguage === 'bn') {
        await changeLanguage(preferredLanguage);
      }

      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await loginWithEmail(email, password);
    if (result.success && result.user) {
      await saveUser(result.user);
    } else {
      throw new Error(result.error || 'auth/unknown');
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const result = await registerWithEmail(name, email, phone, password);
    if (result.success && result.user) {
      await saveUser(result.user);
    } else {
      throw new Error(result.error || 'auth/unknown');
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('@user_id');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      await saveUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin || false,
        canAccessAdmin: Boolean(user && (user.isAdmin || user.role === 'delivery')),
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
