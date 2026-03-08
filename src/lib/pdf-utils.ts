'use client';

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

/**
 * Extracts text from a PDF file on the client side.
 * @param file The PDF file to process.
 * @returns A promise that resolves to the extracted text.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '') // Safety check for str
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim() || "No text could be extracted from this document.";
  } catch (error) {
    console.error("PDF Extraction error:", error);
    throw new Error("Could not extract text from PDF.");
  }
}
