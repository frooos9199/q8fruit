import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db, fetchAdminNotifications, markNotificationAsRead } from '../services/firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  orderId?: string;
  createdAt: any;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();

    if (!db) {
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }

    const notificationsQuery = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const data: Notification[] = snapshot.docs.map((document) => {
        const raw = document.data() as Omit<Notification, 'id'>;
        return {
          id: document.id,
          title: raw.title || '',
          message: raw.message || '',
          type: raw.type || 'order',
          orderId: raw.orderId,
          createdAt: raw.createdAt || new Date(),
          read: Boolean(raw.read),
        };
      });
      setNotifications(data);
    }, (error) => {
      console.error('Realtime notifications error:', error);
    });

    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchAdminNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => setNotifications([]);

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, clearAll, refreshNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
