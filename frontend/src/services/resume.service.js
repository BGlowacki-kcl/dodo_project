import * as pdfjs from "pdfjs-dist/build/pdf";

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

export default async function getParsedResume(file){
    try{
        const text = await extractTextFromPDF(file);
        if(!text){
            throw new Error("No text extraxcted");
        }
        const response = await getChatResponse(text);

        return await responseToJson(response);
        
    } catch (err) {
        console.error("Error occured while generating text: "+err);
        throw new Error("Error: "+err);
    }
}

async function responseToJson(response){
    const responseJSON = await response.json();
    let answer = responseJSON.data.choices[0].message.content.trim();
    if (answer.startsWith(`"data":`)) {
        answer = `{ ${answer} }`; 
    }
    try {
        const jsonData = JSON.parse(answer); 
        return jsonData?.data || null;
    } catch (error) {
        console.error("Invalid JSON format:", error);
        return null;
    }
}

async function getChatResponse(text){
    return await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            //'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({
            query: text,
        })
    });
}

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
    } catch (err) {
        console.error('Error reading PDF:', err);
        throw new Error("Error: "+err);
    }
};