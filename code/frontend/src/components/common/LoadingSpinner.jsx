import React from 'react';

const LoadingSpinner = ({ fullPage = false, message = "Chargement des données..." }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative w-14 h-14">
        {/* Glow halo */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"></div>
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
        {/* Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
