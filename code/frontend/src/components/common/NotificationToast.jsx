import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'error':
        return { bg: 'bg-red-600 text-white', icon: '✕' };
      case 'warning':
        return { bg: 'bg-amber-500 text-white', icon: '⚠' };
      case 'success':
      default:
        return { bg: 'bg-emerald-600 text-white', icon: '✓' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] max-w-sm w-full space-y-3 pointer-events-none font-sans">
        {toasts.map((toast) => {
          const styles = getTypeStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-lg ${styles.bg}`}
            >
              <span className="text-base shrink-0 font-bold">{styles.icon}</span>
              <p className="flex-1 text-sm font-semibold leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 opacity-70 hover:opacity-100 font-bold text-sm leading-none"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
