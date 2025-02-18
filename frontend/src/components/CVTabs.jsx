import React, { useState } from "react";

const CVTabs = () => {
  const [activeTab, setActiveTab] = useState("Personal");

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    email: "",
    phone: "",
  });

  const [educationEntries, setEducationEntries] = useState([
    { id: 1, institute: "", duration: "", course: "", grade: "" }
  ]);

  const [experienceEntries, setExperienceEntries] = useState([
    { id: 1, company: "", position: "", duration: "", description: "" }
  ]);

  const [projectEntries, setProjectEntries] = useState([
    { id: 1, title: "", description: "", technologies: "" }
  ]);

  const handleInputChange = (e, index = null, section = null) => {
    const { name, value } = e.target;

    if (section) {
      const setEntries =
        section === "Education"
          ? setEducationEntries
          : section === "Experience"
          ? setExperienceEntries
          : setProjectEntries;

      setEntries((prevEntries) =>
        prevEntries.map((entry, i) =>
          i === index ? { ...entry, [name]: value } : entry
        )
      );
    } else {
      setPersonalInfo((prevInfo) => ({
        ...prevInfo,
        [name]: value
      }));
    }
  };

  const handleAddEntry = (section) => {
    if (section === "Education") {
      setEducationEntries((prevEntries) => [
        ...prevEntries,
        { id: prevEntries.length + 1, institute: "", duration: "", course: "", grade: "" }
      ]);
    } else if (section === "Experience") {
      setExperienceEntries((prevEntries) => [
        ...prevEntries,
        { id: prevEntries.length + 1, company: "", position: "", duration: "" }
      ]);
    } else if (section === "Projects") {
      setProjectEntries((prevEntries) => [
        ...prevEntries,
        { id: prevEntries.length + 1, title: "", description: "", technologies: "", description: ""}
      ]);
    }
  };

  const handleRemoveEntry = (index, section) => {
    if (section === "Education") {
      setEducationEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
    } else if (section === "Experience") {
      setExperienceEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
    } else if (section === "Projects") {
      setProjectEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
    }
  };

  const sections = {
    Personal: [
      { label: "Name", name: "name", need: true },
      { label: "Email", name: "email", need: true },
      { label: "Phone Number", name: "phone", need: false },
      { label: "Location", name: "location", need: false },
      { label: "LinkedIn", name: "linkedin", need: false },
      { label: "GitHub", name: "github", need: false },
      { label: "Portfolio", name: "portfolio", need: false }
    ],
  };

  const tabData = [
    { id: "Personal", label: "Personal" },
    { id: "Education", label: "Education" },
    { id: "Experience", label: "Experience" },
    { id: "Projects", label: "Projects" }
  ];

  return (
    <div>
      <div className="flex bg-[#1b2a41] justify-center py-5">
        {tabData.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tablink px-4 py-2 ${
              activeTab === tab.id ? "text-white" : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 bg-[#324a5f] px-60 py-10 h-full">
        <h3 className="text-xl font-bold text-white">{activeTab} Information</h3>
        <div className="space-y-4 mt-3">
          {["Education", "Experience", "Projects"].includes(activeTab) ? (
            <>
              {(activeTab === "Education" ? educationEntries :
                activeTab === "Experience" ? experienceEntries : projectEntries
              ).map((entry, index) => (
                <div key={entry.id} className="bg-[#1b2a41] p-4 rounded-md relative">
                  <button
                    className="absolute right-0 top-0"
                    onClick={() => handleRemoveEntry(index, activeTab)}
                  >
                    ✖
                  </button>
                  {(activeTab === "Education"
                    ? [
                        { label: "Institute", name: "institute" },
                        { label: "Duration", name: "duration" },
                        { label: "Course", name: "course" },
                        { label: "Grade", name: "grade" }
                      ]
                    : activeTab === "Experience"
                    ? [
                        { label: "Company", name: "company" },
                        { label: "Position", name: "position" },
                        { label: "Duration", name: "duration" },
                        { label: "Description", name: "description" }
                      ]
                    : [
                        { label: "Project Title", name: "title" },
                        { label: "Description", name: "description" },
                        { label: "Technologies Used", name: "technologies" }
                      ]
                  ).map(({ label, name }) => (
                    <div key={name} className="flex items-center mb-3">
                      <label className="w-48 text-white flex items-center">{label}</label>
                      <input
                        type="text"
                        name={name}
                        value={entry[name] || ""}
                        onChange={(e) => handleInputChange(e, index, activeTab)}
                        className="w-full px-4 py-2 rounded-md text-black text-sm"
                      />
                    </div>
                  ))}
                </div>
              ))}
              <button
                onClick={() => handleAddEntry(activeTab)}
                className="mt-4 bg-[#ccc9dc] text-black py-2 px-4 rounded-md hover:scale-105"
              >
                + Add {activeTab}
              </button>
            </>
          ) : (
            sections[activeTab]?.map(({ label, name, need }) => (
              <div key={name} className="flex items-center">
                <label className="w-48 text-white flex items-center">
                  {label}
                  {need && <p className="text-red-500 ml-1">*</p>}
                </label>
                <input
                  type="text"
                  name={name}
                  value={personalInfo[name] || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md text-black text-sm"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CVTabs;

