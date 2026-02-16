import React, { useState, useRef, useEffect } from 'react';

export default function DraggableAnnotation({ 
  children, 
  initialX, 
  initialY, 
  disabled, 
  className = '',
  style = {}
}) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handleMouseDown = (e) => {
    if (disabled) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || disabled) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: disabled ? 'default' : 'move',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
}