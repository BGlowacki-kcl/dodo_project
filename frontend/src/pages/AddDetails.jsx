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
        if (!file) return;
    
        setLoading(true);
    
        try {
          const data = await getParsedResume(file);
          if (!data) {
            throw new Error("No data received from parser!");
          }
          handleAutoFill(data);
        } catch (err) {
          setError("Error: " + err);
        } finally {
          setLoading(false);
        }
    };
    
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
    };

    const updateNestedState = (section, index, field, value) => {
        const updatedSection = [...userData[section]];
        updatedSection[index][field] = value;
        setUserData({ ...userData, [section]: updatedSection });
    };

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

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (skillInput.trim() && !userData.skills.includes(skillInput.trim())) {
            setUserData({ 
                ...userData, 
                skills: [...userData.skills, skillInput.trim()] 
            });
            setSkillInput("");
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setUserData({
            ...userData,
            skills: userData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const handleSkillKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await userService.updateUser(userData);
            navigate("/dashboard");
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#001933] via-[#1A2A44] to-[#2D3A42] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full mx-auto p-10 bg-white shadow-xl rounded-xl border border-[#1A2A44]">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center tracking-tight">Complete Your Profile</h2>

                <div className="mb-10">
                    <h5 className="text-lg font-medium text-gray-700 mb-4">Upload Your Resume (PDF)</h5>
                    <label 
                        htmlFor="pdfInput" 
                        className="flex items-center justify-center w-full h-14 bg-gradient-to-r from-[#002147] to-[#36454F] text-white rounded-lg cursor-pointer hover:from-[#001933] hover:to-[#2D3A42] transition-all duration-300"
                    >
                        <span className="text-sm font-medium">Choose File</span>
                        <input type="file" id="pdfInput" accept="application/pdf" className="hidden" onChange={handleUpload} />
                    </label>
                    {loading && (
                        <div className="text-green-500 text-sm mt-3 text-center">Loading...</div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                            <input 
                                type="text" 
                                value={userData.name} 
                                onChange={(e) => handleChange("name", e.target.value)} 
                                required 
                                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Location</label>
                            <input 
                                type="text" 
                                value={userData.location} 
                                onChange={(e) => handleChange("location", e.target.value)} 
                                required 
                                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                placeholder="Enter your location"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                            <input 
                                type="text" 
                                value={userData.phoneNumber} 
                                onChange={(e) => handleChange("phoneNumber", e.target.value)} 
                                required 
                                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
                            <input 
                                type="date" 
                                value={userData.dob} 
                                onChange={(e) => handleChange("dob", e.target.value)} 
                                required 
                                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-gray-50 p-8 rounded-xl shadow-md">
                        <label className="block text-gray-900 font-semibold mb-5">Education</label>
                        {userData.education.map((edu, index) => (
                            <div key={index} className="border border-gray-300 p-6 rounded-xl mb-6 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <input 
                                        type="text" 
                                        placeholder="Institution" 
                                        value={edu.institution}
                                        onChange={(e) => updateNestedState("education", index, "institution", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                    />

                                    <input 
                                        type="text" 
                                        placeholder="Degree" 
                                        value={edu.degree}
                                        onChange={(e) => updateNestedState("education", index, "degree", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                    />

                                    <input 
                                        type="text" 
                                        placeholder="Field of Study" 
                                        value={edu.fieldOfStudy}
                                        onChange={(e) => updateNestedState("education", index, "fieldOfStudy", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                    />

                                    <div className="col-span-2">
                                        <textarea 
                                            placeholder="Description" 
                                            value={edu.description}
                                            onChange={(e) => updateNestedState("education", index, "description", e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                            rows="3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Start Date</label>
                                        <input 
                                            type="date" 
                                            value={edu.startDate}
                                            onChange={(e) => updateNestedState("education", index, "startDate", e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">End Date</label>
                                        <input 
                                            type="date" 
                                            value={edu.endDate}
                                            onChange={(e) => updateNestedState("education", index, "endDate", e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveEducation(index)} 
                                    className="mt-5 text-red-500 font-medium hover:text-red-700 transition-all duration-200"
                                >
                                    Remove Education
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={handleAddEducation} 
                            className="w-full bg-gradient-to-r from-[#002147] to-[#36454F] text-white py-3 rounded-lg hover:from-[#001933] hover:to-[#2D3A42] transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                        >
                            + Add Education
                        </button>
                    </div>

                    {/* Experience */}
                    <div className="bg-gray-50 p-8 rounded-xl shadow-md">
                        <label className="block text-gray-900 font-semibold mb-5">Experience</label>
                        {userData.experience.map((exp, index) => (
                            <div key={index} className="border border-gray-300 p-6 rounded-xl mb-6 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <input 
                                        type="text" 
                                        placeholder="Company" 
                                        value={exp.company}
                                        onChange={(e) => updateNestedState("experience", index, "company", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                    />

                                    <input 
                                        type="text" 
                                        placeholder="Title" 
                                        value={exp.title}
                                        onChange={(e) => updateNestedState("experience", index, "title", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                    />

                                    <input 
                                        type="text" 
                                        placeholder="Field of Work" 
                                        value={exp.fieldOfWork}
                                        onChange={(e) => updateNestedState("experience", index, "fieldOfWork", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                    />

                                    <div className="col-span-2">
                                        <textarea 
                                            placeholder="Description" 
                                            value={exp.description}
                                            onChange={(e) => updateNestedState("experience", index, "description", e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                                            rows="3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Start Date</label>
                                        <input 
                                            type="date" 
                                            value={exp.startDate}
                                            onChange={(e) => updateNestedState("experience", index, "startDate", e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">End Date</label>
                                        <input 
                                            type="date" 
                                            value={exp.endDate}
                                            onChange={(e) => updateNestedState("experience", index, "endDate", e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveExperience(index)} 
                                    className="mt-5 text-red-500 font-medium hover:text-red-700 transition-all duration-200"
                                >
                                    Remove Experience
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={handleAddExperience} 
                            className="w-full bg-gradient-to-r from-[#002147] to-[#36454F] text-white py-3 rounded-lg hover:from-[#001933] hover:to-[#2D3A42] transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                        >
                            + Add Experience
                        </button>
                    </div>

                    {/* Skills */}
                    <div className="bg-gray-50 p-8 rounded-xl shadow-md">
                        <label className="block text-gray-900 font-semibold mb-5">Skills</label>
                        <div className="flex items-center gap-5 mb-6">
                            <input 
                                type="text" 
                                placeholder="Add a skill (press Enter or click Add)" 
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={handleSkillKeyPress}
                                className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#4A6FA5] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                            />
                            <button 
                                type="button" 
                                onClick={handleAddSkill} 
                                className="bg-gradient-to-r from-[#002147] to-[#36454F] text-white px-5 py-3 rounded-lg hover:from-[#001933] hover:to-[#2D3A42] transition-all duration-300 font-medium shadow-md hover:shadow-lg whitespace-nowrap"
                            >
                                Add Skill
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {userData.skills.map((skill) => (
                                <div 
                                    key={skill} 
                                    className="inline-flex items-center bg-[#4A6FA5] text-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <span className="text-sm font-medium mr-2">{skill}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="text-white hover:text-gray-200 transition-all duration-200 font-bold"
                                        aria-label={`Remove ${skill}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        {userData.skills.length === 0 && (
                            <p className="text-gray-500 text-sm mt-2">No skills added yet</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-[#002147] to-[#36454F] text-white py-4 rounded-lg hover:from-[#001933] hover:to-[#2D3A42] transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                    >
                        Complete Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddDetails;