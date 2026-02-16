import React from 'react';
import { Highlighter, Type, MessageSquare, Pencil, Eraser, Hand, PenTool } from 'lucide-react';

export default function AnnotationTools({ 
  selectedTool, 
  onToolSelect, 
  isPremium, 
  onUpgrade, 
  selectedColor, 
  onColorChange,
  selectedFontSize,
  onFontSizeChange
}) {
  const tools = [
  { id: 'select', icon: Hand, label: 'Select', premium: false },
  { id: 'highlight', icon: Highlighter, label: 'Highlight', premium: false },
  { id: 'text', icon: Type, label: 'Text', premium: true },
  { id: 'comment', icon: MessageSquare, label: 'Comment', premium: true },
  { id: 'draw', icon: Pencil, label: 'Draw', premium: true },
  { id: 'signature', icon: PenTool, label: 'Signature', premium: true },
  { id: 'erase', icon: Eraser, label: 'Erase', premium: false }
];

  const colors = [
    { name: 'Yellow', value: '#FFEB3B' },
    { name: 'Green', value: '#4CAF50' },
    { name: 'Blue', value: '#2196F3' },
    { name: 'Pink', value: '#E91E63' },
    { name: 'Orange', value: '#FF9800' }
  ];

  const fontSizes = [
    { label: 'Small', value: 12 },
    { label: 'Normal', value: 14 },
    { label: 'Medium', value: 16 },
    { label: 'Large', value: 20 },
    { label: 'XLarge', value: 24 }
  ];

 const handleToolClick = (tool) => {
  if (tool.premium && !isPremium) {
    onUpgrade();
  } else {
    // Toggle: if clicking the same tool, deselect it
    if (selectedTool === tool.id) {
      onToolSelect(null); // Deselect
    } else {
      onToolSelect(tool.id);
    }
  }
};

  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          {/* Tools */}
          <div className="flex items-center gap-2">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  selectedTool === tool.id
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                    : 'hover:bg-gray-100 text-gray-700'
                } ${tool.premium && !isPremium ? 'opacity-60' : ''}`}
                title={tool.label}
              >
                <tool.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tool.label}</span>
                {tool.premium && !isPremium && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1 rounded">
                    PRO
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Color Picker (for highlight/draw tools) */}
          {(selectedTool === 'highlight' || selectedTool === 'draw') && (
            <div className="flex items-center gap-2 border-l border-gray-300 pl-6">
              <span className="text-sm font-medium text-gray-700">Color:</span>
              {colors.map(color => (
                <button
                  key={color.value}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-gray-800 ring-2 ring-gray-400 scale-110'
                      : 'border-gray-300 hover:border-gray-500 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  onClick={() => onColorChange(color.value)}
                />
              ))}
            </div>
          )}

          {/* Font Size Picker (for text tool) */}
          {selectedTool === 'text' && (
            <div className="flex items-center gap-2 border-l border-gray-300 pl-6">
              <span className="text-sm font-medium text-gray-700">Size:</span>
              {fontSizes.map(size => (
                <button
                  key={size.value}
                  className={`px-3 py-1 rounded transition-all text-xs font-medium ${
                    selectedFontSize === size.value
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => onFontSizeChange(size.value)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="ml-auto text-sm text-gray-600">
            {!selectedTool && 'Click a tool to start annotating'}
            {selectedTool === 'select' && 'Click and drag annotations to move them'}
            {selectedTool === 'highlight' && 'Click and drag to highlight text'}
            {selectedTool === 'text' && 'Click anywhere to add text (PRO)'}
            {selectedTool === 'comment' && 'Click to add a comment note (PRO)'}
            {selectedTool === 'draw' && 'Click and drag to draw (PRO)'}
            {selectedTool === 'signature' && 'Click to add your signature (PRO)'}
            {selectedTool === 'erase' && 'Click on annotations to delete them'}
          </div>
        </div>
      </div>
    </div>
  );
}