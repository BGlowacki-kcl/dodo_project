/**
 * Resume Service
 * Handles PDF resume parsing and extraction
 */
import * as pdfjs from "pdfjs-dist/build/pdf";
import { checkTokenExpiration } from "./auth.service";
import { makeApiRequest } from "./helper";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

/**
 * Extracts text content from a PDF file
 * @param {File} file - PDF file
 * @returns {Promise<string>} - Extracted text
 * @throws {Error} - If extraction fails
 */
async function extractTextFromPDF(file) {
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
    
    return fullText;
  } catch (error) {
    throw new Error(`Error reading PDF: ${error.message}`);
  }
}

/**
 * Converts Chat API response to JSON object
 * @param {Response} response - API response
 * @returns {Promise<Object|null>} - Parsed JSON or null on error
 */
async function prepareAnswer(response) {
    console.log("response: ",response);
  let answer = response.choices[0].message.content.trim();
  console.log("answer: ",answer);
  
  if (answer.startsWith(`"data":`)) {
    answer = `{ ${answer} }`;
  }
  
  try {
    const jsonData = JSON.parse(answer);
    return jsonData?.data || null;
  } catch (error) {
    return null;
  }
}

/**
 * Parses a resume PDF and returns structured data
 * @param {File} file - PDF file
 * @returns {Promise<Object|null>} - Parsed resume data
 * @throws {Error} - If parsing fails
 */
export default async function getParsedResume(file) {
  try {
    const text = await extractTextFromPDF(file);
    
    if (!text) {
      throw new Error("No text extracted from PDF");
    }
    
    const response = await makeApiRequest("/api/chat", "POST", { query: text });
    return await prepareAnswer(response);
  } catch (error) {
    throw new Error(`Error parsing resume: ${error.message}`);
  }
}