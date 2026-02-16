import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ResizableSignature({ 
  annotation, 
  selectedTool, 
  onDelete,
  onUpdate 
}) {
  const [position, setPosition] = useState({ x: annotation.x, y: annotation.y });
  const [size, setSize] = useState({ width: annotation.width, height: annotation.height });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const handleDragStart = (e) => {
    if (selectedTool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeStart = (e) => {
    if (selectedTool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        
        // Use the larger delta to maintain aspect ratio
        const delta = Math.max(dx, dy);
        const aspectRatio = resizeStart.w / resizeStart.h;
        
        const newWidth = Math.max(50, resizeStart.w + delta);
        const newHeight = newWidth / aspectRatio;
        
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        onUpdate({
          ...annotation,
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height
        });
        setIsDragging(false);
        setIsResizing(false);
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, position, size, resizeStart, annotation, onUpdate]);

  return (
    <div
      className={`absolute ${
        selectedTool === 'select' 
          ? 'ring-4 ring-blue-500 shadow-lg' 
          : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: selectedTool === 'select' ? 'move' : 'default',
        padding: '4px'
      }}
      onMouseDown={handleDragStart}
    >
      {/* Signature Image */}
      <img
        src={annotation.imageData}
        alt="Signature"
        className="w-full h-full object-contain pointer-events-none"
        style={{ 
          mixBlendMode: 'darken',
          filter: 'brightness(1.1) contrast(1.1)'
        }}
      />

      {/* Resize Handle - Bottom Right Corner */}
      {selectedTool === 'select' && (
        <div
          className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-600 border-4 border-white rounded-full cursor-nwse-resize shadow-xl hover:scale-125 transition-transform z-50"
          onMouseDown={handleResizeStart}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Delete for Erase Mode */}
      {selectedTool === 'erase' && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-80 cursor-pointer hover:bg-opacity-90"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(annotation.id);
          }}
        >
          <X className="w-12 h-12 text-white" />
        </div>
      )}
    </div>
  );
}