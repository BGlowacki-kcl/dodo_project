import React, { useState } from "react";

const CVTabs = () => {
  const [activeTab, setActiveTab] = useState("Personal");

  const [entries, setEntries] = useState({
    Education: [{ id: 1, institute: "", duration: "", course: "", grade: "" }],
    Experience: [{ id: 1, company: "", position: "", duration: "", description: "" }],
    Projects: [{ id: 1, title: "", description: "", technologies: "" }],
  });

  const [personalInfo, setPersonalInfo] = useState({
    name: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: ""
  });

  const sections = {
    Personal: [
      { label: "Name", name: "name", required: true },
      { label: "Email", name: "email", required: true },
      { label: "Phone", name: "phone" },
      { label: "Location", name: "location" },
      { label: "LinkedIn", name: "linkedin" },
      { label: "GitHub", name: "github" },
      { label: "Portfolio", name: "portfolio" }
    ],
    Education: [
      { label: "Institute", name: "institute" },
      { label: "Duration", name: "duration" },
      { label: "Course", name: "course" },
      { label: "Grade", name: "grade" }
    ],
    Experience: [
      { label: "Company", name: "company" },
      { label: "Position", name: "position" },
      { label: "Duration", name: "duration" },
      { label: "Description", name: "description" }
    ],
    Projects: [
      { label: "Project Title", name: "title" },
      { label: "Description", name: "description" },
      { label: "Technologies Used", name: "technologies" }
    ]
  };

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      setEntries(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map((entry, i) =>
          i === index ? { ...entry, [name]: value } : entry
        )
      }));
    } else {
      setPersonalInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddEntry = () => {
    setEntries(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], { id: prev[activeTab].length + 1, ...Object.fromEntries(sections[activeTab].map(f => [f.name, ""])) }]
    }));
  };

  const handleRemoveEntry = (index) => {
    setEntries(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((_, i) => i !== index)
    }));
  };

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex bg-[#1b2a41] justify-center py-5">
        {Object.keys(sections).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`tablink px-4 py-2 ${activeTab === tab ? "text-ltext" : "text-gray-500"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5 bg-background px-60 py-10">
        <h3 className="text-xl font-bold text-white">{activeTab} Information</h3>
        <div className="space-y-4 mt-3">
          {activeTab === "Personal" ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              {sections.Personal.map(({ label, name, required }) => (
                <div key={name} className="flex items-center mb-4">
                  <label className="w-48 text-gray-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
                  <input type="text" name={name} value={personalInfo[name] || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-red-700" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {entries[activeTab].map((entry, index) => (
                <div key={entry.id} className="bg-white p-6 rounded-lg shadow-md relative">
                  <button className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveEntry(index)}>✖</button>
                  {sections[activeTab].map(({ label, name }) => (
                    <div key={name} className="flex items-center mb-3">
                      <label className="w-48 text-gray-700">{label}</label>
                      <input type="text" name={name} value={entry[name] || ""}
                        onChange={(e) => handleInputChange(e, index)}
                        className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-red-700" />
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={() => handleAddEntry(activeTab)} className="button">
                + Add {activeTab}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVTabs;
