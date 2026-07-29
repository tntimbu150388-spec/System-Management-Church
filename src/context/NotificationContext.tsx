import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notifikasi } from '../types';
import { getCollection, addItem, updateItem } from '../services/db';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: Notifikasi[];
  unreadCount: number;
  toasts: Toast[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  sendNotification: (userId: string, judul: string, pesan: string, tipe?: Notifikasi['Tipe']) => void;
  showToast: (title: string, message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  refreshNotifications: (userId?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notifikasi[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const refreshNotifications = (userId?: string) => {
    const allNotifs = getCollection('NOTIFIKASI') || [];
    if (userId) {
      const userNotifs = allNotifs.filter(
        (n) => n.UserID === userId || n.UserID === 'ALL' || !n.UserID
      );
      setNotifications(userNotifs);
    } else {
      setNotifications(allNotifs);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.Dibaca).length;

  const markAsRead = (id: string) => {
    updateItem('NOTIFIKASI', 'NotifID', id, { Dibaca: true });
    setNotifications((prev) =>
      prev.map((n) => (n.NotifID === id ? { ...n, Dibaca: true } : n))
    );
  };

  const markAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.Dibaca) {
        updateItem('NOTIFIKASI', 'NotifID', n.NotifID, { Dibaca: true });
      }
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, Dibaca: true })));
  };

  const showToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = 'TST-' + Date.now().toString().slice(-6);
    const newToast: Toast = { id, title, message, type };
    setToasts((prev) => [newToast, ...prev]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const sendNotification = (
    userId: string,
    judul: string,
    pesan: string,
    tipe: Notifikasi['Tipe'] = 'Sistem'
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newNotif: Notifikasi = {
      NotifID: 'NTF-' + Date.now().toString().slice(-6),
      UserID: userId,
      Judul: judul,
      Pesan: pesan,
      Dibaca: false,
      Tanggal: now,
      Tipe: tipe,
    };
    addItem('NOTIFIKASI', newNotif);
    refreshNotifications(userId);
    showToast(judul, pesan, 'info');
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        markAsRead,
        markAllAsRead,
        sendNotification,
        showToast,
        removeToast,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
