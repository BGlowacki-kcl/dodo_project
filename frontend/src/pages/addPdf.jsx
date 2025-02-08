import React, { useEffect, useState } from 'react'
import extractTextFromPDF from "../services/resume.service.js";

function addPdf() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if(!file) return;

    setLoading(true);

    extractTextFromPDF(file, setText, setError);
  }

  return (
    <div>
        <h1> Add pdf </h1>
        <input type="file" id="pdfInput" accept="application/pdf" onChange={handleUpload} />
        {loading && <div>Loading...</div>}
        {text && <div className='w-96 border-3 border-black'>{text}</div>}
    </div>
  )
}

export default addPdf;