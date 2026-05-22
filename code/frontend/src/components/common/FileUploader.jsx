import React, { useState, useRef } from 'react';

const FileUploader = ({
  onFileSelect,
  accept = 'image/*,application/pdf',
  maxSizeMb = 10,
  multiple = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFiles = (fileList) => {
    const selectedFiles = Array.from(fileList);
    const validFiles = selectedFiles.filter(file => {
      const isLtMax = file.size / 1024 / 1024 < maxSizeMb;
      if (!isLtMax) {
        alert(`Le fichier ${file.name} dépasse la limite autorisée de ${maxSizeMb} Mo.`);
      }
      return isLtMax;
    });

    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : [validFiles[0]];
      setFiles(updatedFiles);
      if (onFileSelect) {
        onFileSelect(multiple ? updatedFiles : updatedFiles[0]);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (indexToRemove, e) => {
    e.stopPropagation();
    const updatedFiles = files.filter((_, idx) => idx !== indexToRemove);
    setFiles(updatedFiles);
    if (onFileSelect) {
      onFileSelect(multiple ? updatedFiles : (updatedFiles[0] || null));
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`w-full rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-2 group ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        {/* Upload Icon */}
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-lg shadow-inner group-hover:scale-105 transition-transform duration-300">
          📥
        </div>

        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-250">
            {isDragActive ? 'Déposez vos fichiers ici...' : 'Glissez-déposez un fichier ou parcourez'}
          </p>
          <p className="text-[10px] text-slate-405 font-medium">
            Formats acceptés : PDF, JPG, PNG (Max. {maxSizeMb} Mo)
          </p>
        </div>
      </div>

      {/* Render Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {files.map((file, idx) => (
            <div 
              key={idx} 
              className="px-3.5 py-2 border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 animate-slideIn"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-base shrink-0">📄</span>
                <span className="truncate">{file.name}</span>
                <span className="text-[10px] text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} Mo)</span>
              </div>
              <button
                type="button"
                onClick={(e) => removeFile(idx, e)}
                className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
