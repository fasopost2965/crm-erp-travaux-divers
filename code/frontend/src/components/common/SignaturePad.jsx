import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

const SignaturePad = forwardRef(({ onSave, onClear, label = 'Signature' }, ref) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [isEmpty, setIsEmpty] = useState(true);

  // Expose getDataURL via ref
  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    },
    isEmpty: () => isEmpty,
    clear: () => handleClear(),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e, canvas);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const currentPos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPosRef.current = currentPos;
    setIsEmpty(false);
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // Notify parent with current data URL
    if (onSave && canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    if (onClear) onClear();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
          {label}
        </label>
      )}
      <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white">
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-300 dark:text-slate-600 text-xs font-semibold italic select-none">
              Signez ici...
            </span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full block touch-none cursor-crosshair"
          style={{ height: '160px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="text-[10px] font-bold text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
      >
        Effacer la signature
      </button>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
