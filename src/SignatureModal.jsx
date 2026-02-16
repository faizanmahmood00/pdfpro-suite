import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2, Check } from 'lucide-react';

export default function SignatureModal({ onClose, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveSignature = () => {
  if (!hasDrawn) {
    alert('Please draw your signature first');
    return;
  }
  
  const canvas = canvasRef.current;
  
  // Create a temporary canvas to remove white background
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  
  // Draw original signature
  tempCtx.drawImage(canvas, 0, 0);
  
  // Get image data and make white pixels transparent
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // If pixel is very close to white, make it transparent
    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
      data[i + 3] = 0; // Set alpha to 0
    }
  }
  
  tempCtx.putImageData(imageData, 0, 0);
  const imageDataUrl = tempCanvas.toDataURL('image/png');
  
  onSave(imageDataUrl);
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Your Signature</h2>
            <p className="text-gray-600 text-sm mt-1">Draw your signature in the box below</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Signature Canvas */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4 bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        <div className="text-xs text-gray-500 mb-6 text-center">
          Draw your signature using your mouse or trackpad
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={clearSignature}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          
          <button
            onClick={saveSignature}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Check className="w-5 h-5" />
            Add Signature to Document
          </button>
        </div>
      </div>
    </div>
  );
}