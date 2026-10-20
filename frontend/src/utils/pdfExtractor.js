import * as pdfjsLib from 'pdfjs-dist';

// Use the CDN or bundled worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Extracts plain text from an uploaded PDF file directly in the browser.
 * @param {File} file 
 * @returns {Promise<{ extractedText: string, wordCount: number, characterCount: number, snippet: string }>}
 */
export async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  const cleanedText = fullText
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleanedText ? cleanedText.split(/\s+/).length : 0;
  const chars = cleanedText.length;
  const snippet = cleanedText.slice(0, 300) + (cleanedText.length > 300 ? '...' : '');

  return {
    extractedText: cleanedText,
    wordCount: words,
    characterCount: chars,
    snippet,
  };
}
