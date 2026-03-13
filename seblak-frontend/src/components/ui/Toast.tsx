'use client';

import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// Global toast state management (simple implementation)
let toastListeners: ((toast: Toast) => void)[] = [];
let toastCounter = 0;

export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const id = `toast-${toastCounter++}`;
  const toast: Toast = { id, message, type };
  toastListeners.forEach(listener => listener(toast));
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };

    toastListeners.push(handleToast);

    return () => {
      toastListeners = toastListeners.filter(l => l !== handleToast);
    };
  }, []);

  const getColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      success: { bg: 'bg-green-500', text: 'text-white', icon: '✅' },
      error: { bg: 'bg-red-500', text: 'text-white', icon: '❌' },
      info: { bg: 'bg-blue-500', text: 'text-white', icon: 'ℹ️' },
      warning: { bg: 'bg-yellow-500', text: 'text-white', icon: '⚠️' },
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const color = getColor(toast.type);
        return (
          <div
            key={toast.id}
            className={`${color.bg} ${color.text} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-64 animate-in`}
          >
            <span className="text-xl">{color.icon}</span>
            <p className="font-semibold">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}