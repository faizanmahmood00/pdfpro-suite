import React, { useState } from 'react';
import { FileText, Crown, X, Upload } from 'lucide-react';
import PDFViewer from './PDFViewer';

export default function PDFEditor() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [isPremium, setIsPremium] = useState(true);
  const [showViewer, setShowViewer] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      // Check file size (free users limited to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File too large! Free users can upload PDFs up to 10MB. Upgrade to Pro for larger files.');
        setShowPaywall(true);
        return;
      }
      
      setPdfFile(file);
      setShowViewer(true);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const closeViewer = () => {
    setShowViewer(false);
    setPdfFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDFPro Suite</h1>
              <p className="text-xs text-gray-500">Edit, Read, Collaborate</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowPaywall(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Pro
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">View PDFs</h3>
            <p className="text-gray-600 text-sm">Open and view PDF files with smooth navigation</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Quick Upload</h3>
            <p className="text-gray-600 text-sm">Drag and drop or click to upload PDFs instantly</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 relative">
            <div className="absolute top-2 right-2">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Edit & Annotate</h3>
            <p className="text-gray-600 text-sm">Add comments, highlights, and signatures (Pro)</p>
          </div>
        </div>

        {/* Main Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-indigo-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PDFPro Suite</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Upload a PDF to start viewing, editing, and collaborating. Free tier includes basic features.
            </p>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl">
                <Upload className="w-5 h-5" />
                Upload PDF File
              </div>
            </label>
            
            <p className="text-sm text-gray-500 mt-4">
              Free: Up to 10MB • Pro: Up to 100MB
            </p>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showViewer && pdfFile && (
        <PDFViewer 
  file={pdfFile} 
  onClose={closeViewer}
  isPremium={isPremium}
  onUpgrade={() => setShowPaywall(true)}
/>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to PDFPro</h2>
                <p className="text-gray-600">Unlock powerful features and remove limitations</p>
              </div>
              <button onClick={() => setShowPaywall(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Pro Monthly */}
              <div className="border-2 border-indigo-500 rounded-xl p-6 bg-indigo-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Pro Monthly</h3>
                    <div className="text-3xl font-bold text-gray-900">$12.99</div>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                  <Crown className="w-8 h-8 text-yellow-500" />
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Upload files up to 100MB</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Advanced editing tools</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Add annotations & signatures</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>No ads</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Cloud storage (5GB)</span>
                  </li>
                </ul>
                
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                  Get Started
                </button>
              </div>

              {/* Pro Annual */}
              <div className="border-2 border-gray-300 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Pro Annual</h3>
                    <div className="text-3xl font-bold text-gray-900">$99.99</div>
                    <p className="text-sm text-green-600 font-semibold">Save $56/year</p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                    BEST VALUE
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Everything in Pro Monthly</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Cloud storage (25GB)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>API access</span>
                  </li>
                </ul>
                
                <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Get Started
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              14-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>
      )}
    </div>
  );
}