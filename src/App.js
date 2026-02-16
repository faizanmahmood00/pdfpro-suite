import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import PDFEditor from './PDFEditor';

function App() {
  return (
    <>
      <PDFEditor />
      <Analytics />
    </>
  );
}

export default App;