import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-500 text-white dark:bg-red-900 dark:text-red-100',
          icon: '❌',
          border: 'border-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500 text-slate-900 dark:bg-amber-950 dark:text-amber-100',
          icon: '⚠️',
          border: 'border-amber-600',
        };
      case 'success':
      default:
        return {
          bg: 'bg-emerald-500 text-white dark:bg-emerald-900 dark:text-emerald-100',
          icon: '✅',
          border: 'border-emerald-600',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Floating Container */}
      <div className="fixed bottom-5 right-5 z-[9999] max-w-sm w-full space-y-3 pointer-events-none font-sans">
        {toasts.map((toast) => {
          const styles = getTypeStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl flex items-start space-x-3 border border-opacity-15 animate-slideIn ${styles.bg} ${styles.border}`}
            >
              <span className="text-base shrink-0">{styles.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-normal">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-white/70 hover:text-white cursor-pointer font-bold text-xs"
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
