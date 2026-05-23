import React from 'react';

const ConfirmDialog = ({
  isOpen,
  title = "Confirmer l'action",
  message = 'Êtes-vous sûr de vouloir effectuer cette action ? Cette opération peut être irréversible.',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-50 text-red-600',
          btnBg: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
          icon: '⚠️',
        };
      case 'info':
        return {
          iconBg: 'bg-blue-50 text-blue-600',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
          icon: 'ℹ️',
        };
      case 'warning':
      default:
        return {
          iconBg: 'bg-amber-50 text-amber-600',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
          icon: '⚠️',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`py-2 px-5 rounded-xl font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.btnBg} disabled:opacity-50`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  En cours...
                </span>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
