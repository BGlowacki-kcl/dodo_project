import React, { useState } from "react";
import { userService } from "../services/user.service";
import { useNavigate } from "react-router-dom";
import getParsedResume from "../services/resume.service";

const AddDetails = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [userData, setUserData] = useState({
        name: "",
        location: "",
        phoneNumber: "",
        dob: "",
        education: [],
        experience: [],
        skills: [],
    });

    const [skillInput, setSkillInput] = useState("");

    const handleChange = (field, value) => {
        setUserData({ ...userData, [field]: value });
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if(!file) return;
    
        setLoading(true);
    
        try{
          const data = await getParsedResume(file);
          if (!data) {
            throw new Error("No data received from parser!");
          }
          handleAutoFill(data);
        } catch (err) {
          setError("Error: "+err);
        } finally {
          setLoading(false);
        }
      }
    
      const handleAutoFill = (data) => {
        setUserData({
            name: `${data?.personal?.name || ""} ${data?.personal?.surname || ""}`.trim(),
            location: data?.personal?.location || "",
            phoneNumber: data?.personal?.phoneNumber || "",
            dob: data?.personal?.dateOfBirth || "",
            education: data?.education?.map((edu) => ({
                institution: edu?.University || "",
                degree: edu?.Degree || "",
                fieldOfStudy: edu?.Major || "",
                description: edu?.description || "",
            })) || [],
            experience: data?.experience?.map((exp) => ({
                company: exp?.company || "",
                title: exp?.position || "",
                fieldOfWork: exp?.fieldOfWork || "",
                description: exp?.description || "",
            })) || [],
            skills: data?.projects?.reduce((acc, project) => {
                const projectSkills = project?.skills?.split(",").map(skill => skill.trim()) || [];
                return [...new Set([...acc, ...projectSkills])];
            }, []) || []
        });
      }

    // Update nested state values for education & experience
    const updateNestedState = (section, index, field, value) => {
        const updatedSection = [...userData[section]];
        updatedSection[index][field] = value;
        setUserData({ ...userData, [section]: updatedSection });
    };

    // Education Functions
    const handleAddEducation = () => {
        setUserData({
            ...userData,
            education: [...userData.education, { 
                institution: "", 
                degree: "", 
                fieldOfStudy: "", 
                description: "", 
                startDate: "", 
                endDate: "" 
            }]
        });
    };

    const handleRemoveEducation = (index) => {
        setUserData({
            ...userData,
            education: userData.education.filter((_, i) => i !== index)
        });
    };

    // Experience Functions
    const handleAddExperience = () => {
        setUserData({
            ...userData,
            experience: [...userData.experience, { 
                company: "", 
                title: "", 
                fieldOfWork: "", 
                description: "", 
                startDate: "", 
                endDate: "" 
            }]
        });
    };

    const handleRemoveExperience = (index) => {
        setUserData({
            ...userData,
            experience: userData.experience.filter((_, i) => i !== index)
        });
    };

    // Skill Functions
    const handleAddSkill = () => {
        if (skillInput.trim() && !userData.skills.includes(skillInput)) {
            setUserData({ ...userData, skills: [...userData.skills, skillInput.trim()] });
            setSkillInput("");
        }
    };

    const handleRemoveSkill = (index) => {
        setUserData({
            ...userData,
            skills: userData.skills.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.updateUser(userData);
            navigate("/");
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleDoThisLater = () => {
        navigate("/");
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
            <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>

            <h5 className="mt-5 ml-10"> Add PDF </h5>
            <input type="file" id="pdfInput" accept="application/pdf" className="mt-3 ml-10 mb-20" onChange={handleUpload} />
            {loading && 
                <div className="text-green-500 m-3"> Loading </div>
            }

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div>
                    <label className="block text-gray-700 font-medium">Full Name</label>
                    <input type="text" value={userData.name} onChange={(e) => handleChange("name", e.target.value)} required 
                        className="w-full border rounded p-2 mt-1" />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium">Location</label>
                    <input type="text" value={userData.location} onChange={(e) => handleChange("location", e.target.value)} required
                        className="w-full border rounded p-2 mt-1" />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium">Phone Number</label>
                    <input type="text" value={userData.phoneNumber} onChange={(e) => handleChange("phoneNumber", e.target.value)} required 
                        className="w-full border rounded p-2 mt-1" />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium">Date of Birth</label>
                    <input type="date" value={userData.dob} onChange={(e) => handleChange("dob", e.target.value)} required 
                        className="w-full border rounded p-2 mt-1" />
                </div>

                {/* Education */}
                <div>
                    <label className="block text-gray-700 font-medium">Education</label>
                    {userData.education.map((edu, index) => (
                        <div key={index} className="border p-3 rounded mt-2">
                            <input type="text" placeholder="Institution" value={edu.institution}
                                onChange={(e) => updateNestedState("education", index, "institution", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <input type="text" placeholder="Degree" value={edu.degree}
                                onChange={(e) => updateNestedState("education", index, "degree", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy}
                                onChange={(e) => updateNestedState("education", index, "fieldOfStudy", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <textarea placeholder="Description" value={edu.description}
                                onChange={(e) => updateNestedState("education", index, "description", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <label>From:</label>
                            <input type="date" value={edu.startDate}
                                onChange={(e) => updateNestedState("education", index, "startDate", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <label>Till:</label>
                            <input type="date" value={edu.endDate}
                                onChange={(e) => updateNestedState("education", index, "endDate", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <button type="button" onClick={() => handleRemoveEducation(index)} 
                                className="text-red-500 mt-2">
                                Remove
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddEducation} className="text-blue-500 mt-2">
                        + Add Education
                    </button>
                </div>

                {/* Experience */}
                <div>
                    <label className="block text-gray-700 font-medium">Experience</label>
                    {userData.experience.map((exp, index) => (
                        <div key={index} className="border p-3 rounded mt-2">
                            <input type="text" placeholder="Company" value={exp.company}
                                onChange={(e) => updateNestedState("experience", index, "company", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <input type="text" placeholder="Title" value={exp.title}
                                onChange={(e) => updateNestedState("experience", index, "title", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <input type="text" placeholder="Field of Work" value={exp.fieldOfWork}
                                onChange={(e) => updateNestedState("experience", index, "fieldOfWork", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <textarea placeholder="Description" value={exp.description}
                                onChange={(e) => updateNestedState("experience", index, "description", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <label>From:</label>
                            <input type="date" value={exp.startDate}
                                onChange={(e) => updateNestedState("experience", index, "startDate", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <label>Till:</label>
                            <input type="date" value={exp.endDate}
                                onChange={(e) => updateNestedState("experience", index, "endDate", e.target.value)}
                                className="w-full border rounded p-2 mt-1" />

                            <button type="button" onClick={() => handleRemoveExperience(index)} 
                                className="text-red-500 mt-2">
                                Remove
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddExperience} className="text-blue-500 mt-2">
                        + Add Experience
                    </button>
                </div>

                {/* Skills */}
                <div>
                    <label className="block text-gray-700 font-medium">Skills</label>
                    <div className="flex items-center gap-2">
                        <input type="text" placeholder="Add a skill" value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            className="w-full border rounded p-2 mt-1" />
                        <button type="button" onClick={handleAddSkill} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Add
                        </button>
                    </div>
                    <div className="mt-2">
                        {userData.skills.map((skill, index) => (
                            <div key={index} className="inline-flex items-center bg-gray-200 rounded px-3 py-1 mr-2 mt-2">
                                <span>{skill}</span>
                                <button type="button" onClick={() => handleRemoveSkill(index)} 
                                    className="ml-2 text-red-500">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4">
                    Complete Profile
                </button>
                <button type="button" onClick={handleDoThisLater} className="w-full bg-gray-500 text-white py-2 rounded mt-4">
                    Complete this later
                </button>
            </form>
        </div>
    );
};

export default AddDetails;