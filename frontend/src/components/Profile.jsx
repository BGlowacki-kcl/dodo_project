import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import { FaUser, FaGraduationCap, FaBriefcase, FaTools, FaFileAlt, FaEdit, FaSave, FaPlus, FaTrash } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';

const Profile = ({ editable }) => { 
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState({
        personal: editable || false,
        education: editable || false,
        experience: editable || false,
        skills: editable || false,
        resume: editable || false
    });
    const [editableUser, setEditableUser] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const userData = await userService.getUserProfile();
                setUser(userData);
                setEditableUser(userData.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        }

        fetchUserProfile();
    }, []);

    const handleEditClick = (section) => {
        setIsEditing((prevState) => ({
            ...prevState,
            [section]: !prevState[section]
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const parts = name.split('.');
        if (parts.length === 3) { 
            const [field, index, subField] = parts;
            const updatedArray = [...(editableUser[field] || [])];
            updatedArray[parseInt(index)] = {
                ...updatedArray[parseInt(index)], 
                [subField]: value
            };
            setEditableUser((prevState) => ({
                ...prevState,
                [field]: updatedArray
            }));
        } else if (parts.length === 2) { 
            const [field, index] = parts;
            const updatedArray = [...(editableUser[field] || [])];
            updatedArray[parseInt(index)] = value;
            setEditableUser((prevState) => ({
                ...prevState,
                [field]: updatedArray
            }));
        } else { 
            setEditableUser((prevState) => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSaveClick = async (section) => {
        try {
            await userService.updateUser(editableUser);
            setUser((prevState) => ({
                ...prevState,
                data: editableUser
            }));
            setIsEditing((prevState) => ({
                ...prevState,
                [section]: false
            }));
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleAddItem = (section) => {
        setEditableUser((prevState) => ({
            ...prevState,
            [section]: [...prevState[section], section === 'skills' ? "" : {}]
        }));
    };

    const handleRemoveItem = (section, index) => {
        setEditableUser((prevState) => ({
            ...prevState,
            [section]: prevState[section].filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error fetching user profile: {error.message}</p>;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatDateForInput = (dateValue) => {
        if (!dateValue) return "";
        if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }
        return new Date(dateValue).toISOString().split("T")[0];
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-row items-center mb-8 mr-20" >
                <h1 className="text-4xl font-bold text-left text-black mr-20">
                    Profile
                </h1>
                <div className="flex flex-row bg-gray-400 p-3 border-1 border-black rounded-xl cursor-pointer" onClick={() => navigate('/addDetails') } >
                    <FaSave className="cursor-pointer mr-5 mt-1" onClick={() => handleSaveClick('personal')} />
                    Update whole profile
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-black">
                            <FaUser className="inline-block mr-2" /> Personal Information
                        </h2>
                        {isEditing.personal ? (
                            <FaSave className="cursor-pointer" onClick={() => handleSaveClick('personal')} />
                        ) : (
                            <FaEdit className="cursor-pointer" onClick={() => handleEditClick('personal')} />
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p className="text-black"><strong>Name:</strong> {isEditing.personal ? <input type="text" name="name" value={editableUser.name || ""} onChange={handleInputChange} className="border p-1" /> : user.data.name}</p>
                        <p className="text-black"><strong style={{ marginLeft: '-50px' }}>LinkedIn:</strong> {isEditing.personal ? <input type="text" name="linkedin" value={editableUser.linkedin || ""} onChange={handleInputChange} className="border p-1" /> : <a href={user.data.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.linkedin}</a>}</p>
                        <p className="text-black"><strong>Email:</strong> {isEditing.personal ? <input type="text" name="email" value={editableUser.email || ""} onChange={handleInputChange} className="border p-1" /> : user.data.email}</p>
                        <p className="text-black"><strong style={{ marginLeft: '-50px' }}>GitHub:</strong> {isEditing.personal ? <input type="text" name="github" value={editableUser.github || ""} onChange={handleInputChange} className="border p-1" /> : <a href={user.data.github} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.github}</a>}</p>
                        <p className="text-black"><strong>Phone Number:</strong> {isEditing.personal ? <input type="text" name="phoneNumber" value={editableUser.phoneNumber || ""} onChange={handleInputChange} className="border p-1" /> : user.data.phoneNumber}</p>
                        <p className="text-black"><strong style={{ marginLeft: '-50px' }}>Portfolio:</strong> {isEditing.personal ? <input type="text" name="portfolio" value={editableUser.portfolio || ""} onChange={handleInputChange} className="border p-1" /> : <a href={user.data.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.portfolio}</a>}</p>
                        <p className="text-black"><strong>Location:</strong> {isEditing.personal ? <input type="text" name="location" value={editableUser.location || ""} onChange={handleInputChange} className="border p-1" /> : user.data.location}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-black">
                            <FaGraduationCap className="inline-block mr-2" /> Education
                        </h2>
                        {isEditing.education ? (
                            <FaSave className="cursor-pointer" onClick={() => handleSaveClick('education')} />
                        ) : (
                            <FaEdit className="cursor-pointer" onClick={() => handleEditClick('education')} />
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editableUser.education && editableUser.education.map((edu, index) => (
                            <div key={index} className="p-4 border rounded-lg mb-4 relative">
                                <p className="text-black"><strong>Institution:</strong> {isEditing.education ? <input type="text" name={`education.${index}.institution`} value={edu.institution || ""} onChange={handleInputChange} className="border p-1" /> : edu.institution}</p>
                                <p className="text-black"><strong>Degree:</strong> {isEditing.education ? <input type="text" name={`education.${index}.degree`} value={edu.degree || ""} onChange={handleInputChange} className="border p-1" /> : edu.degree}</p>
                                <p className="text-black"><strong>Field of Study:</strong> {isEditing.education ? <input type="text" name={`education.${index}.fieldOfStudy`} value={edu.fieldOfStudy || ""} onChange={handleInputChange} className="border p-1" /> : edu.fieldOfStudy}</p>
                                <p className="text-black"><strong>Start Date:</strong> {isEditing.education ? 
                                    <input 
                                        type="date" 
                                        name={`education.${index}.startDate`} 
                                        value={formatDateForInput(edu.startDate)} 
                                        onChange={handleInputChange} 
                                        className="border p-1" 
                                    /> 
                                    : formatDate(edu.startDate)}
                                </p>
                                <p className="text-black"><strong>End Date:</strong> {isEditing.education ? 
                                    <input 
                                        type="date" 
                                        name={`education.${index}.endDate`} 
                                        value={formatDateForInput(edu.endDate)} 
                                        onChange={handleInputChange} 
                                        className="border p-1" 
                                    /> 
                                    : formatDate(edu.endDate)}
                                </p>
                                {isEditing.education && (
                                    <FaTrash className="absolute top-2 right-2 cursor-pointer text-red-500" onClick={() => handleRemoveItem('education', index)} />
                                )}
                            </div>
                        ))}
                        {isEditing.education && (
                            <button className="flex items-center justify-center p-2 border rounded-lg text-blue-500" onClick={() => handleAddItem('education')}>
                                <FaPlus className="mr-2" /> Add Education
                            </button>
                        )}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-black">
                            <FaBriefcase className="inline-block mr-2" /> Experience
                        </h2>
                        {isEditing.experience ? (
                            <FaSave className="cursor-pointer" onClick={() => handleSaveClick('experience')} />
                        ) : (
                            <FaEdit className="cursor-pointer" onClick={() => handleEditClick('experience')} />
                        )}
                    </div>
                    <div>
                        {editableUser.experience && editableUser.experience.map((exp, index) => (
                            <div key={index} className="mb-4 p-4 border rounded-lg relative">
                                <div className="flex flex-col md:flex-row justify-between">
                                    <div className="flex-1">
                                        <p className="text-black"><strong>Company:</strong> {isEditing.experience ? <input type="text" name={`experience.${index}.company`} value={exp.company || ""} onChange={handleInputChange} className="border p-1" /> : exp.company}</p>
                                        <p className="text-black"><strong>Title:</strong> {isEditing.experience ? <input type="text" name={`experience.${index}.title`} value={exp.title || ""} onChange={handleInputChange} className="border p-1" /> : exp.title}</p>
                                        <p className="text-black"><strong>Start Date:</strong> {isEditing.experience ? 
                                            <input 
                                                type="date" 
                                                name={`experience.${index}.startDate`} 
                                                value={formatDateForInput(exp.startDate)} 
                                                onChange={handleInputChange} 
                                                className="border p-1" 
                                            /> 
                                            : formatDate(exp.startDate)}
                                        </p>
                                        <p className="text-black"><strong>End Date:</strong> {isEditing.experience ? 
                                            <input 
                                                type="date" 
                                                name={`experience.${index}.endDate`} 
                                                value={formatDateForInput(exp.endDate)} 
                                                onChange={handleInputChange} 
                                                className="border p-1" 
                                            /> 
                                            : formatDate(exp.endDate)}
                                        </p>
                                    </div>
                                    <div className="flex-1 md:ml-4">
                                        <p className="text-black"><strong>Description:</strong></p>
                                        <p className="text-black">{isEditing.experience ? <textarea name={`experience.${index}.description`} value={exp.description || ""} onChange={handleInputChange} className="border p-1 w-full" /> : exp.description}</p>
                                    </div>
                                </div>
                                {isEditing.experience && (
                                    <FaTrash className="absolute top-2 right-2 cursor-pointer text-red-500" onClick={() => handleRemoveItem('experience', index)} />
                                )}
                            </div>
                        ))}
                        {isEditing.experience && (
                            <button className="flex items-center justify-center p-2 border rounded-lg text-blue-500" onClick={() => handleAddItem('experience')}>
                                <FaPlus className="mr-2" /> Add Experience
                            </button>
                        )}
                        {(!editableUser.experience || editableUser.experience.length === 0) && (
                            <p className="text-black">No experience details available.</p>
                        )}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-black">
                            <FaTools className="inline-block mr-2" /> Skills
                        </h2>
                        {isEditing.skills ? (
                            <FaSave className="cursor-pointer" onClick={() => handleSaveClick('skills')} />
                        ) : (
                            <FaEdit className="cursor-pointer" onClick={() => handleEditClick('skills')} />
                        )}
                    </div>
                    {isEditing.skills ? (
                        <div>
                            {editableUser.skills && editableUser.skills.map((skill, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input type="text" name={`skills.${index}`} value={skill || ""} onChange={handleInputChange} className="border p-1 flex-1" />
                                    <FaTrash className="ml-2 cursor-pointer text-red-500" onClick={() => handleRemoveItem('skills', index)} />
                                </div>
                            ))}
                            <button className="flex items-center justify-center p-2 border rounded-lg text-blue-500" onClick={() => handleAddItem('skills')}>
                                <FaPlus className="mr-2" /> Add Skill
                            </button>
                        </div>
                    ) : (
                        user.data.skills && user.data.skills.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {user.data.skills.map((skill, index) => (
                                    <span key={index} className="bg-gray-200 px-2 py-1 rounded">{skill}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-black">No skills available.</p>
                        )
                    )}
                </div>
                {/* 
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold mb-4 text-black">
                            <FaFileAlt className="inline-block mr-2" /> Resume
                        </h2>
                        {isEditing.resume ? (
                            <FaSave className="cursor-pointer" onClick={() => handleSaveClick('resume')} />
                        ) : (
                            <FaEdit className="cursor-pointer" onClick={() => handleEditClick('resume')} />
                        )}
                    </div>
                    {isEditing.resume ? (
                        <div>
                            <input type="text" name="resume" value={editableUser.resume} onChange={handleInputChange} className="border p-1 w-full" />
                        </div>
                    ) : (
                        user.data.resume ? (
                            <a href={user.data.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Resume</a>
                        ) : (
                            <p className="text-black">No resume available.</p>
                        )
                    )}
                </div>
                */}
            </div>
        </div>
    );
};

export default Profile;