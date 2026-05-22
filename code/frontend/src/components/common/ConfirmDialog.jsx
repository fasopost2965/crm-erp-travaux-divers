import React from 'react';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirmer l\'action',
  message = 'Êtes-vous sûr de vouloir effectuer cette action ? Cette opération peut être irréversible.',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning', // 'warning', 'danger', 'info'
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
          btnBg: 'bg-red-655 hover:bg-red-600 text-white shadow-red-900/10 focus:ring-red-500',
          icon: '⚠️',
        };
      case 'info':
        return {
          iconBg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
          btnBg: 'bg-blue-600 hover:bg-blue-550 text-white shadow-blue-900/10 focus:ring-blue-500',
          icon: 'ℹ️',
        };
      case 'warning':
      default:
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
          btnBg: 'bg-amber-600 hover:bg-amber-550 text-white shadow-amber-900/10 focus:ring-amber-500',
          icon: '⚠️',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={loading ? undefined : onCancel}
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Modal body */}
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl transition-all animate-scaleUp">
          
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl shrink-0 shadow-inner ${styles.iconBg}`}>
              {styles.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-slate-850 dark:text-white leading-snug">
                {title}
              </h3>
              <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`py-2.5 px-5 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.btnBg} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Opération en cours...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
