import React, { useRef, useEffect, useState } from 'react';
import DraggableAnnotation from './DraggableAnnotation';
import ResizableSignature from './ResizableSignature';
import pdfService from './pdfService';
import SignatureModal from './SignatureModal';
import AnnotationTools from './AnnotationTools';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X, Trash2 } from 'lucide-react';

export default function PDFViewer({ file, onClose, isPremium, onUpgrade }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [textLayer, setTextLayer] = useState([]);
  
  // Annotation states
  const [selectedTool, setSelectedTool] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#FFEB3B');
const [selectedFontSize, setSelectedFontSize] = useState(14); // Add this line
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [highlightStart, setHighlightStart] = useState(null);
  const [highlightEnd, setHighlightEnd] = useState(null);

  useEffect(() => {
    if (file) {
      loadPDF();
    }
  }, [file]);

  useEffect(() => {
    if (pdf) {
      renderPage();
    }
  }, [pdf, currentPage, scale]);

  const loadPDF = async () => {
  try {
    console.log('Loading PDF...', file);
    setLoading(true);
    const loadedPdf = await pdfService.loadPDF(file);
    console.log('PDF loaded successfully:', loadedPdf);
    setPdf(loadedPdf);
    setTotalPages(loadedPdf.numPages);
    console.log('Total pages:', loadedPdf.numPages);
    setLoading(false);
  } catch (error) {
    console.error('Error loading PDF:', error);
    alert('Failed to load PDF. Please try another file.');
    setLoading(false);
  }
};

  const renderPage = async () => {
  if (!pdf || !canvasRef.current) return;
  
  try {
    await pdfService.renderPage(pdf, currentPage, canvasRef.current, scale);
    // Load text layer for smart highlighting
    const textItems = await pdfService.getTextLayer(pdf, currentPage, scale);
    setTextLayer(textItems);
  } catch (error) {
    if (error.name !== 'RenderingCancelledException') {
      console.error('Error rendering page:', error);
    }
  }
};

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setAnnotations([]);
      setTextLayer([]);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
  };

  // Find text items that intersect with selection rectangle
  const getTextInSelection = (startX, startY, endX, endY) => {
    const left = Math.min(startX, endX);
    const right = Math.max(startX, endX);
    const top = Math.min(startY, endY);
    const bottom = Math.max(startY, endY);

    return textLayer.filter(item => {
      const itemRight = item.x + item.width;
      const itemBottom = item.y + item.height;
      
      // Check if text item intersects with selection
      return !(itemRight < left || 
               item.x > right || 
               itemBottom < top || 
               item.y > bottom);
    });
  };

 const handleMouseDown = (e) => {
  if (!overlayRef.current) return;
  // If no tool is selected, do nothing
  if (!selectedTool) return;

  const rect = overlayRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Only handle mouse down for active annotation tools
  if (selectedTool === 'highlight') {
    setHighlightStart({ x, y });
    setHighlightEnd({ x, y });
    setIsDrawing(true);
  } else if (selectedTool === 'draw') {
    setIsDrawing(true);
    setDrawingPath([{ x, y }]);
  } else if (selectedTool === 'text') {
    const text = prompt('Enter text:');
    if (text) {
      setAnnotations([...annotations, {
        type: 'text',
        x,
        y,
        text,
        fontSize: selectedFontSize,
        page: currentPage,
        id: Date.now()
      }]);
    }
  } else if (selectedTool === 'comment') {
    const comment = prompt('Enter comment:');
    if (comment) {
      setAnnotations([...annotations, {
        type: 'comment',
        x,
        y,
        text: comment,
        page: currentPage,
        id: Date.now()
      }]);
    }
  } else if (selectedTool === 'signature') {
    setShowSignatureModal({ x, y });
  }
};

  const handleMouseMove = (e) => {
    if (!isDrawing || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'highlight') {
      setHighlightEnd({ x, y });
    } else if (selectedTool === 'draw') {
      setDrawingPath([...drawingPath, { x, y }]);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      if (selectedTool === 'highlight' && highlightStart && highlightEnd) {
  // Create a simple highlight rectangle
  const left = Math.min(highlightStart.x, highlightEnd.x);
  const top = Math.min(highlightStart.y, highlightEnd.y);
  const width = Math.abs(highlightEnd.x - highlightStart.x);
  const height = Math.abs(highlightEnd.y - highlightStart.y);

  // Only create highlight if there's actual drag (not just a click)
  if (width > 5 && height > 5) {
    setAnnotations([...annotations, {
      type: 'highlight',
      x: left,
      y: top,
      width: width,
      height: height,
      color: selectedColor,
      page: currentPage,
      id: Date.now()
    }]);
  }

  setHighlightStart(null);
  setHighlightEnd(null);
} else if (selectedTool === 'draw' && drawingPath.length > 1) {
        setAnnotations([...annotations, {
          type: 'draw',
          path: drawingPath,
          color: selectedColor,
          page: currentPage,
          id: Date.now()
        }]);
        setDrawingPath([]);
      }
      setIsDrawing(false);
    }
  };
  const saveSignature = (imageData) => {
  if (showSignatureModal) {
    setAnnotations([...annotations, {
      type: 'signature',
      x: showSignatureModal.x,
      y: showSignatureModal.y,
      imageData,
      width: 150,
      height: 50,
      page: currentPage,
      id: Date.now()
    }]);
    setShowSignatureModal(false);
  }
};
const updateAnnotation = (updatedAnnotation) => {
  setAnnotations(annotations.map(a => 
    a.id === updatedAnnotation.id ? updatedAnnotation : a
  ));
};

  const deleteAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const clearAllAnnotations = () => {
    if (window.confirm('Clear all annotations on this page?')) {
      setAnnotations([]);
    }
  };

  const pageAnnotations = annotations.filter(a => a.page === currentPage);

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header Controls */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="font-medium">{file.name}</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Page Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.25))}
              className="p-2 rounded hover:bg-gray-700 transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <span className="text-sm w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={() => setScale(Math.min(3, scale + 0.25))}
              className="p-2 rounded hover:bg-gray-700 transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Annotation Controls */}
          {pageAnnotations.length > 0 && (
            <button
              onClick={clearAllAnnotations}
              className="flex items-center gap-2 bg-red-600 px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Annotation Toolbar */}
      <AnnotationTools
  selectedTool={selectedTool}
  onToolSelect={setSelectedTool}
  isPremium={isPremium}
  onUpgrade={onUpgrade}
  selectedColor={selectedColor}
  onColorChange={setSelectedColor}
  selectedFontSize={selectedFontSize}
  onFontSizeChange={setSelectedFontSize}
/>

      {/* PDF Canvas with Annotation Overlay */}
      <div className="flex-1 overflow-auto bg-gray-800 p-8">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                <p>Loading PDF...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-2xl mx-auto relative" style={{ width: 'fit-content' }}>
              <canvas ref={canvasRef} className="block" />
              
              {/* Annotation Overlay */}
              <div
  ref={overlayRef}
  className="absolute inset-0"
  style={{ 
    cursor: selectedTool === 'select' || selectedTool === 'erase' || !selectedTool
      ? 'default' 
      : 'crosshair' 
  }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Selection rectangle (while highlighting) */}
                {isDrawing && highlightStart && highlightEnd && selectedTool === 'highlight' && (
                  <div
  className="absolute border-2 border-blue-500 bg-blue-200 opacity-30 pointer-events-none"
                    style={{
                      left: Math.min(highlightStart.x, highlightEnd.x),
                      top: Math.min(highlightStart.y, highlightEnd.y),
                      width: Math.abs(highlightEnd.x - highlightStart.x),
                      height: Math.abs(highlightEnd.y - highlightStart.y)
                    }}
                  />
                )}

                {/* Render highlights */}
{pageAnnotations.filter(a => a.type === 'highlight').map(annotation => (
  <div
    key={annotation.id}
    className="absolute opacity-40 group hover:opacity-60 transition-opacity"
    style={{
      left: annotation.x,
      top: annotation.y,
      width: annotation.width,
      height: annotation.height,
      backgroundColor: annotation.color,
      pointerEvents: selectedTool === 'erase' ? 'auto' : 'none',
      cursor: selectedTool === 'erase' ? 'pointer' : 'default'
    }}
    onClick={(e) => {
      e.stopPropagation();
      if (selectedTool === 'erase') {
        deleteAnnotation(annotation.id);
      }
    }}
  >
    {selectedTool === 'erase' && (
      <button className="hidden group-hover:flex absolute inset-0 items-center justify-center bg-red-500 bg-opacity-80">
        <X className="w-4 h-4 text-white" />
      </button>
    )}
  </div>
))}

                {/* Render text annotations */}
{pageAnnotations.filter(a => a.type === 'text').map(annotation => (
  <DraggableAnnotation
  key={annotation.id}
  initialX={annotation.x}
  initialY={annotation.y}
  disabled={selectedTool !== 'select'}
  className={`bg-transparent px-2 py-1 rounded border group ${
    selectedTool === 'select' 
      ? 'border-blue-500 hover:border-blue-700 bg-blue-50 bg-opacity-50' 
      : 'border-transparent hover:border-gray-300'
  }`}
>
    <span 
  className="font-medium"
  style={{ 
    fontSize: `${annotation.fontSize || 14}px`,
    cursor: 'text',
    display: 'inline-block'
  }}
  onDoubleClick={() => {
  const newText = prompt('Edit text:', annotation.text);
  if (newText !== null && newText !== annotation.text) {
    // Ask for font size if text changed
    const sizeOptions = '12 (Small), 14 (Normal), 16 (Medium), 20 (Large), 24 (XLarge)';
    const newSize = prompt(`Font size (${sizeOptions}):`, annotation.fontSize || 14);
    const fontSize = parseInt(newSize) || annotation.fontSize || 14;
    
    setAnnotations(annotations.map(a => 
      a.id === annotation.id ? { ...a, text: newText, fontSize } : a
    ));
  }
}}
    >
      {annotation.text}
    </span>
    {selectedTool === 'select' && (
      <span className="ml-2 text-xs text-gray-400">(drag or double-click to edit)</span>
    )}
    {selectedTool === 'erase' && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteAnnotation(annotation.id);
        }}
        className="hidden group-hover:flex absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full items-center justify-center"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </DraggableAnnotation>
))}

                {/* Render comments */}
{pageAnnotations.filter(a => a.type === 'comment').map(annotation => (
  <DraggableAnnotation
    key={annotation.id}
    initialX={annotation.x}
    initialY={annotation.y}
    disabled={selectedTool !== 'select'}
    className={`bg-yellow-100 px-3 py-2 rounded-lg shadow-lg border-2 max-w-xs group ${
      selectedTool === 'select' ? 'border-yellow-400 hover:border-yellow-600' : 'border-yellow-300'
    }`}
  >
    <p 
      className="text-xs"
      onDoubleClick={() => {
        const newText = prompt('Edit comment:', annotation.text);
        if (newText && newText !== annotation.text) {
          setAnnotations(annotations.map(a => 
            a.id === annotation.id ? { ...a, text: newText } : a
          ));
        }
      }}
      style={{ cursor: 'text' }}
    >
      {annotation.text}
    </p>
    {selectedTool === 'select' && (
      <span className="text-xs text-gray-500 mt-1 block">(drag or double-click to edit)</span>
    )}
    {selectedTool === 'erase' && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteAnnotation(annotation.id);
        }}
        className="hidden group-hover:flex absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full items-center justify-center"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </DraggableAnnotation>
))}
{/* Render signatures */}
{pageAnnotations.filter(a => a.type === 'signature').map(annotation => (
  <ResizableSignature
    key={annotation.id}
    annotation={annotation}
    selectedTool={selectedTool}
    onDelete={deleteAnnotation}
    onUpdate={updateAnnotation}
  />
))}

                {/* Render drawings */}
<svg className="absolute inset-0 w-full h-full pointer-events-none">
  {pageAnnotations.filter(a => a.type === 'draw').map(annotation => (
    <g key={annotation.id}>
      <polyline
        points={annotation.path.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={annotation.color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ 
          pointerEvents: selectedTool === 'erase' ? 'auto' : 'none',
          cursor: selectedTool === 'erase' ? 'pointer' : 'default'
        }}
        onClick={() => selectedTool === 'erase' && deleteAnnotation(annotation.id)}
        className={selectedTool === 'erase' ? 'hover:opacity-50' : ''}
      />
      {/* Invisible wider stroke for easier clicking */}
      {selectedTool === 'erase' && (
        <polyline
          points={annotation.path.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="transparent"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
          onClick={() => deleteAnnotation(annotation.id)}
        />
      )}
    </g>
  ))}
                  
                  {isDrawing && drawingPath.length > 1 && (
                    <polyline
                      points={drawingPath.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke={selectedColor}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <SignatureModal
          onClose={() => setShowSignatureModal(false)}
          onSave={saveSignature}
        />
      )}
    </div>
  );
}