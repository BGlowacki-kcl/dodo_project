// import React, { useEffect, useState } from 'react'
// import getParsedResume from "../services/resume.service.js";
// import renderData from '../components/moreInformationForm.jsx';

// function addPdf() {
//   const [text, setText] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

  
//   // const handleUpload = async (event) => {
//   //   const file = event.target.files[0];
//   //   if(!file) return;

//   //   setLoading(true);

//   //   try{
//   //     const data = await getParsedResume(file);
//   //     if (!data) {
//   //       throw new Error("No data received from parser!");
//   //     }
//   //     setText(data);
//   //   } catch (err) {
//   //     setError("Error: "+err);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }

//   return (
//     <div>
//         <h1> Add PDF </h1>
//         <input type="file" id="pdfInput" accept="application/pdf" onChange={handleUpload} />
        
//         {loading && <div>Loading...</div>}
//         {error && <div className="text-red-600"> {error} </div>}
        
//         {text && renderData(text)}
//     </div>
// );

// }

// export default addPdf;