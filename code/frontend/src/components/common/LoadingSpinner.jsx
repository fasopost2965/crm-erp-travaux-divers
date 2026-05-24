import React from 'react';

const LoadingSpinner = ({ fullPage = false, message = "Chargement des données..." }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#C85A2A] border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <p className="text-sm font-medium text-slate-500">{message}</p>
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
