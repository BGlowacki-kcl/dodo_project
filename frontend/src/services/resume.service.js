import * as pdfjs from "pdfjs-dist/build/pdf";

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

/**
 * Extracts text from a PDF file
 * @param {File} file - The uploaded PDF file
 * @returns {Promise<string>} - Extracted text from the PDF
 */
export default async function extractTextFromPDF(file, setText, setError) {
    try {
        
        const arrayBuffer = await file.arrayBuffer();
        
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        
        setText(fullText);
    } catch (err) {
        setError('Error reading PDF: ' + err.message);
        console.error('Error reading PDF:', err);
    }
};