import React, { useEffect, useState } from 'react';
import getParsedResume from "../services/resume.service.js";
import renderData from '../components/MoreInformationForm.jsx';
import CVTabs from "../components/CVTabs.jsx"

function addPdf() {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if(!file) return;

    setLoading(true);

    try{
      const data = await getParsedResume(file);
      if (!data) {
        throw new Error("No data received from parser!");
      }
      setText(data);
    } catch (err) {
      setError("Error: "+err);
    } finally {
      setLoading(false);
    }
  }

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    location: "",
    portfolio: "",
    linkedin: "",
    github: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value
    }));
  };

  const personal = [
    { label: "Name", name: "name", need: true },
    { label: "Location", name: "location", need: false },
    { label: "Phone", name: "phone", need: false},
    { label: "LinkedIn", name: "linkedin", need: false },
    { label: "GitHub", name: "github", need: false },
    { label: "Portfolio", name: "portfolio", need: false},
  ];

  return (
    <div>
      <div className="items-center justify-center text-left px-60 py-5 bg-component ">
        <h1 className="text-2xl font-semibold mb-4 text-dtext">Complete Your Profile</h1>
        <h2 className="text-xl font-semibold mb-4 text-dtext">Manually type or autofill with your CV</h2>
        <label htmlFor="pdfInput" className="bg-secondary text-white py-2 px-3 rounded-lg">
          Choose a PDF File
        </label>
        <input 
          type="file" 
          id="pdfInput" 
          accept="application/pdf" 
          onChange={handleUpload} 
          className="hidden"
        />

        {loading && <div className="mt-4 text-yellow-400">Loading...</div>}
        {error && <div className="mt-4 text-red-500">{error}</div>}
        {text && <div className="mt-4">{renderData(text)}</div>}
      </div>

      <div>
        <CVTabs/>
      </div>
    </div>
  );
}

// TO DO: change the render data so that if fills the respective fields instead of just printing it out.
// TO DO: add save button, and do later button. The save button should save the entries to the profile.

export default addPdf;