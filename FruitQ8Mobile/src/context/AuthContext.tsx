import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithEmail, registerWithEmail, logoutUser } from '../services/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
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
      if (saved) setUser(JSON.parse(saved));
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('@user_id', userData.id); // حفظ user_id بشكل منفصل
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
      value={{ user, isAdmin: user?.isAdmin || false, login, register, logout, updateProfile }}
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
