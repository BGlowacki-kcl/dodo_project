import React, { useState } from "react";
import { userService } from "../services/user.service";
import { useNavigate } from "react-router-dom";
import getParsedResume from "../services/resume.service";
import { useNotification } from "../context/notification.context";
import { authService } from "../services/auth.service";
import { 
  FaFileAlt, 
  FaUser, 
  FaGraduationCap, 
  FaBriefcase, 
  FaTools, 
  FaCheck, 
  FaTimes, 
  FaPlus, 
  FaTrash 
} from "react-icons/fa";

const AddDetails = () => {
  const navigate = useNavigate();
  const showNotification = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("profile");
  const [showModal, setShowModal] = useState(false);
  
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
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
      showNotification("Resume uploaded and parsed successfully!", "success");
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = (data) => {
    setUserData((prev) => ({
      ...prev,
      name: `${data?.personal?.name || ""} ${data?.personal?.surname || ""}`.trim(),
      location: data?.personal?.location || "",
      phoneNumber: data?.personal?.phoneNumber || "",
      dob: data?.personal?.dateOfBirth || "",
      education: data?.education?.map((edu) => ({
        institution: edu?.University || "",
        degree: edu?.Degree || "",
        fieldOfStudy: edu?.Major || "",
        description: edu?.description || "",
        startDate: "",
        endDate: "",
      })) || [],
      experience: data?.experience?.map((exp) => ({
        company: exp?.company || "",
        title: exp?.position || "",
        fieldOfWork: exp?.fieldOfWork || "",
        description: exp?.description || "",
        startDate: "",
        endDate: "",
      })) || [],
      skills: data?.projects?.reduce((acc, project) => {
        const projectSkills = project?.skills?.split(",").map(skill => skill.trim()) || [];
        return [...new Set([...acc, ...projectSkills])];
      }, []) || [],
    }));
  };

  const updateNestedState = (section, index, field, value) => {
    const updatedSection = [...userData[section]];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    setUserData((prev) => ({ ...prev, [section]: updatedSection }));
  };

  const handleAddEducation = () => {
    setUserData((prev) => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", fieldOfStudy: "", description: "", startDate: "", endDate: "" }],
    }));
  };

  const handleRemoveEducation = (index) => {
    setUserData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleAddExperience = () => {
    setUserData((prev) => ({
      ...prev,
      experience: [...prev.experience, { company: "", title: "", fieldOfWork: "", description: "", startDate: "", endDate: "" }],
    }));
  };

  const handleRemoveExperience = (index) => {
    setUserData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !userData.skills.includes(skillInput.trim())) {
      setUserData((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (index) => {
    setUserData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.updateUser(userData);
      showNotification(response.message, "success");
      navigate("/");
    } catch (error) {
      // Handle network errors or server errors gracefully
      showNotification(error.message || "Network error or server issue", "error");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      showNotification("Logged out successfully!", "success");
      navigate('/');
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const handleDoThisLater = () => {
    setShowModal(true);
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    return new Date(dateValue).toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#1B2A41] shadow-lg p-4 border-r border-[#324A5F] flex flex-col min-h-screen">
        <nav className="space-y-2">
          <button
            onClick={() => setActiveView("profile")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeView === "profile"
                ? "bg-[#324A5F] text-white font-medium"
                : "hover:bg-[#324A5F]/30 text-gray-200"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setShowModal(true)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeView === "logout"
                ? "bg-[#324A5F] text-white font-medium"
                : "hover:bg-[#324A5F]/30 text-gray-200"
            }`}
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 max-w-7xl mx-auto">
        {activeView === "profile" && (
          <div className="space-y-6">
            {/* Skip Button at Top */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleDoThisLater}
                className={`flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                <FaTimes className="mr-2" /> Skip
              </button>
            </div>

            {/* Resume Upload */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaFileAlt className="mr-2" /> Add PDF
              </h2>
              <input
                type="file"
                id="pdfInput"
                accept="application/pdf"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                onChange={handleUpload}
                disabled={loading}
              />
              {loading && <p className="text-green-500 mt-2">Loading...</p>}
            </div>

            {/* Personal Information */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaUser className="mr-2" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Location:</label>
                  <input
                    type="text"
                    name="location"
                    value={userData.location}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Phone Number:</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Date of Birth:</label>
                  <input
                    type="date"
                    name="dob"
                    value={formatDateForInput(userData.dob)}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaGraduationCap className="mr-2" /> Education
              </h2>
              {userData.education.map((edu, index) => (
                <div key={index} className="p-4 border rounded-lg mb-4 relative bg-gray-50">
                  <input
                    type="text"
                    placeholder="Institution"
                    name={`education.${index}.institution`}
                    value={edu.institution}
                    onChange={(e) => updateNestedState("education", index, "institution", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Degree"
                    name={`education.${index}.degree`}
                    value={edu.degree}
                    onChange={(e) => updateNestedState("education", index, "degree", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Field of Study"
                    name={`education.${index}.fieldOfStudy`}
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateNestedState("education", index, "fieldOfStudy", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <textarea
                    placeholder="Description"
                    name={`education.${index}.description`}
                    value={edu.description}
                    onChange={(e) => updateNestedState("education", index, "description", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <label className="block text-gray-700 font-medium">Start Date:</label>
                  <input
                    type="date"
                    name={`education.${index}.startDate`}
                    value={formatDateForInput(edu.startDate)}
                    onChange={(e) => updateNestedState("education", index, "startDate", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <label className="block text-gray-700 font-medium">End Date:</label>
                  <input
                    type="date"
                    name={`education.${index}.endDate`}
                    value={formatDateForInput(edu.endDate)}
                    onChange={(e) => updateNestedState("education", index, "endDate", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <FaTrash
                    className="absolute top-2 right-2 cursor-pointer text-red-500"
                    onClick={() => handleRemoveEducation(index)}
                    disabled={loading}
                  />
                </div>
              ))}
              <button
                className="flex items-center text-blue-500 hover:text-blue-700 mt-2"
                onClick={handleAddEducation}
                disabled={loading}
              >
                <FaPlus className="mr-2" /> Add Education
              </button>
            </div>

            {/* Experience */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaBriefcase className="mr-2" /> Experience
              </h2>
              {userData.experience.map((exp, index) => (
                <div key={index} className="p-4 border rounded-lg mb-4 relative bg-gray-50">
                  <input
                    type="text"
                    placeholder="Company"
                    name={`experience.${index}.company`}
                    value={exp.company}
                    onChange={(e) => updateNestedState("experience", index, "company", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    name={`experience.${index}.title`}
                    value={exp.title}
                    onChange={(e) => updateNestedState("experience", index, "title", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Field of Work"
                    name={`experience.${index}.fieldOfWork`}
                    value={exp.fieldOfWork}
                    onChange={(e) => updateNestedState("experience", index, "fieldOfWork", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <textarea
                    placeholder="Description"
                    name={`experience.${index}.description`}
                    value={exp.description}
                    onChange={(e) => updateNestedState("experience", index, "description", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <label className="block text-gray-700 font-medium">Start Date:</label>
                  <input
                    type="date"
                    name={`experience.${index}.startDate`}
                    value={formatDateForInput(exp.startDate)}
                    onChange={(e) => updateNestedState("experience", index, "startDate", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <label className="block text-gray-700 font-medium">End Date:</label>
                  <input
                    type="date"
                    name={`experience.${index}.endDate`}
                    value={formatDateForInput(exp.endDate)}
                    onChange={(e) => updateNestedState("experience", index, "endDate", e.target.value)}
                    className="w-full border rounded-lg p-2 mb-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <FaTrash
                    className="absolute top-2 right-2 cursor-pointer text-red-500"
                    onClick={() => handleRemoveExperience(index)}
                    disabled={loading}
                  />
                </div>
              ))}
              <button
                className="flex items-center text-blue-500 hover:text-blue-700 mt-2"
                onClick={handleAddExperience}
                disabled={loading}
              >
                <FaPlus className="mr-2" /> Add Experience
              </button>
            </div>

            {/* Skills */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaTools className="mr-2" /> Skills
              </h2>
              {userData.skills.map((skill, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    name={`skills.${index}`}
                    value={skill}
                    onChange={(e) => updateNestedState("skills", index, "", e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    disabled={loading}
                  />
                  <FaTrash
                    className="ml-2 cursor-pointer text-red-500"
                    onClick={() => handleRemoveSkill(index)}
                    disabled={loading}
                  />
                </div>
              ))}
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  disabled={loading}
                />
                <button
                  className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={handleAddSkill}
                  disabled={loading}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Complete Profile Button at Bottom */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                className={`w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                <FaCheck className="mr-2" /> Complete Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              {activeView === "logout" ? "Confirm Logout" : "Confirm Navigation"}
            </h3>
            <p>
              {activeView === "logout"
                ? "Are you sure you want to log out?"
                : "Are you sure you want to skip completing your profile?"}
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={
                  activeView === "logout"
                    ? handleSignOut
                    : () => {
                        setShowModal(false);
                        navigate("/");
                      }
                }
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDetails;