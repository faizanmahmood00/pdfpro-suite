import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

class PDFService {
  async loadPDF(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          resolve(pdf);
        } catch (error) {
          reject(error);
        }
      };
      
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  }

  async renderPage(pdf, pageNumber, canvas, scale = 1.5) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Cancel any ongoing render task
    if (canvas._renderTask) {
      canvas._renderTask.cancel();
    }

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    // Store the render task so we can cancel it if needed
    canvas._renderTask = page.render(renderContext);
    
    try {
      await canvas._renderTask.promise;
      canvas._renderTask = null;
    } catch (error) {
      if (error.name !== 'RenderingCancelledException') {
        throw error;
      }
    }

    return { width: viewport.width, height: viewport.height };
  }

  async extractText(pdf, pageNumber) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    return textContent.items.map(item => item.str).join(' ');
  }

  async getTextLayer(pdf, pageNumber, scale = 1.5) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const textContent = await page.getTextContent();
    
    // Map text items with their positions
    const textItems = textContent.items.map(item => {
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const fontSize = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
      
      return {
        text: item.str,
        x: tx[4],
        y: viewport.height - tx[5],
        width: item.width * viewport.scale,
        height: fontSize,
        fontSize: fontSize
      };
    });
    
    return textItems;
  }
}

export default new PDFService();