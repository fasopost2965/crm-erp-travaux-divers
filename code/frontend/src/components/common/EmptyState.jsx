import React from 'react';

const EmptyState = ({ 
  title = "Aucune donnée disponible", 
  description = "Il n'y a actuellement aucun élément à afficher dans cette section.", 
  actionLabel = null, 
  onAction = null,
  icon = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-sm max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-5 shadow-sm">
        {icon || (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-semibold text-xs shadow-md shadow-blue-900/10 hover:shadow-blue-500/15 transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
