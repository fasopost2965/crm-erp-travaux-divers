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
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const processFiles = (fileList) => {
    const selectedFiles = Array.from(fileList);
    const validFiles = selectedFiles.filter(file => {
      const ok = file.size / 1024 / 1024 < maxSizeMb;
      if (!ok) alert(`Le fichier ${file.name} dépasse la limite de ${maxSizeMb} Mo.`);
      return ok;
    });
    if (validFiles.length > 0) {
      const updated = multiple ? [...files, ...validFiles] : [validFiles[0]];
      setFiles(updated);
      if (onFileSelect) onFileSelect(multiple ? updated : updated[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) processFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) processFiles(e.target.files);
  };

  const removeFile = (idx, e) => {
    e.stopPropagation();
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    if (onFileSelect) onFileSelect(multiple ? updated : (updated[0] || null));
  };

  return (
    <div className="space-y-3 font-sans">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`w-full rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/30'
        }`}
      >
        <input ref={fileInputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" />
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
          📥
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {isDragActive ? 'Déposez vos fichiers ici...' : 'Glissez-déposez ou cliquez pour parcourir'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG — Max. {maxSizeMb} Mo</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, idx) => (
            <div key={idx} className="px-3.5 py-2.5 border border-slate-200 bg-white rounded-xl flex items-center justify-between text-sm text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <span className="text-base shrink-0">📄</span>
                <span className="font-medium truncate">{file.name}</span>
                <span className="text-xs text-slate-400 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} Mo)</span>
              </div>
              <button type="button" onClick={(e) => removeFile(idx, e)} className="text-slate-400 hover:text-red-500 ml-2 shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
