import React, { useEffect, useState } from "react";
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
import UserDetails from "../components/UserDetails";

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
    skills: [],
    education: [],
    experience: [],
    projects: [],
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
        throw new Error("No data received from the resume parser");
      }
      handleAutoFill(data);
      // Use server message if available, otherwise fallback
      const successMessage = data?.message || "Resume uploaded and parsed successfully!";
      showNotification(successMessage, "success");
    } catch (error) {
      showNotification(error.message || "Failed to parse resume", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = (data) => {
    console.log(data);
    setUserData((prev) => ({
      ...prev,
      name: `${data?.personal?.name || ""} ${data?.personal?.surname || ""}`.trim(),
      location: data?.personal?.location || "",
      phoneNumber: data?.personal?.phoneNumber || "",
      dob: data?.personal?.dateOfBirth || "",
      skills: data?.personal?.skills?.map(skill => skill.trim()) || [],
      github: data?.personal?.GitHubWebsite || "",
      linkedin: data?.personal?.LinkedInWebsite || "",
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
      projects: data?.projects?.map((pro) => ({
        description: pro?.description || "",
      })) || [],
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
      
      // Update local user data state with the response data if available
      if (response && response.data) {
        setUserData(response.data);
      }
      
      const successMessage = response?.message || "Profile updated successfully!";
      showNotification(successMessage, "success");
      navigate("/");
    } catch (error) {
      showNotification(error.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await authService.signOut();
      const successMessage = response?.message || "Logged out successfully!";
      showNotification(successMessage, "success");
      navigate('/');
    } catch (error) {
      showNotification(error.message || "Failed to sign out", "error");
    }
  };

  const handleDoThisLater = () => {
    setShowModal(true);
  };

  // Modify the handleSaveSection function to use the existing updateUser method
  const handleSaveSection = async (section, userData) => {
    setLoading(true);
    try {
      console.log("User data: ", userData);
      // Use the existing updateUser method which accepts the full user object
      const response = await userService.updateUser(userData);
      console.log("Response: ", response);
      // Update local user data state with the response data if available
      if (response && response.data) {
        setUserData(response.data);
      }
      
      const successMessage = response?.message || `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`;
      showNotification(successMessage, "success");
    } catch (error) {
      showNotification(error.message || `Failed to update ${section}`, "error");
    } finally {
      setLoading(false);
    }
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

            {/* UserDetails Component */}
            <UserDetails
              user={userData}
              editable={true}
              onChange={(e) => {
                const { name, value } = e.target;
                setUserData((prev) => ({ ...prev, [name]: value }));
              }}
              onAdd={(section) => {
                const newItem = section === "skills" ? "" : {};
                setUserData((prev) => ({ ...prev, [section]: [...prev[section], newItem] }));
              }}
              onRemove={(section, index) => {
                setUserData((prev) => ({
                  ...prev,
                  [section]: prev[section].filter((_, i) => i !== index),
                }));
              }}
              onSave={handleSaveSection}
            />

            {/* Complete Profile Button at Bottom */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                className={`w-full items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
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