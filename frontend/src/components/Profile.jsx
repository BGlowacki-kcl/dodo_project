import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import { FaUser, FaGraduationCap, FaBriefcase, FaTools, FaFileAlt } from 'react-icons/fa'; 

const Profile = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const userData = await userService.getUserProfile();
                setUser(userData);
                console.log('User', userData);
                console.log('User name:', userData.data.name);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        }

        fetchUserProfile();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error fetching user profile: {error.message}</p>;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-left text-black">Profile</h1>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-black">
                        <FaUser className="inline-block mr-2" /> Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p className="text-black"><strong>Name:</strong> {user.data.name}</p>
                        <p className="text-black"><strong>LinkedIn:</strong> <a href={user.data.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.linkedin}</a></p>
                        <p className="text-black"><strong>Email:</strong> {user.data.email}</p>
                        <p className="text-black"><strong>GitHub:</strong> <a href={user.data.github} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.github}</a></p>
                        <p className="text-black"><strong>Phone Number:</strong> {user.data.phoneNumber}</p>
                        <p className="text-black"><strong>Portfolio:</strong> <a href={user.data.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.portfolio}</a></p>
                        <p className="text-black"><strong>Location:</strong> {user.data.location}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-black">
                        <FaGraduationCap className="inline-block mr-2" /> Education
                    </h2>
                    {user.data.education && user.data.education.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.data.education.map((edu, index) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <p className="text-black"><strong>Institution:</strong> {edu.institution}</p>
                                    <p className="text-black"><strong>Degree:</strong> {edu.degree}</p>
                                    <p className="text-black"><strong>Field of Study:</strong> {edu.fieldOfStudy}</p>
                                    <p className="text-black"><strong>Start Date:</strong> {formatDate(edu.startDate)}</p>
                                    <p className="text-black"><strong>End Date:</strong> {formatDate(edu.endDate)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-black">No education details available.</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-black">
                        <FaBriefcase className="inline-block mr-2" /> Experience
                    </h2>
                    {user.data.experience && user.data.experience.length > 0 ? (
                        user.data.experience.map((exp, index) => (
                            <div key={index} className="mb-4 p-4 border rounded-lg">
                                <div className="flex flex-col md:flex-row justify-between">
                                    <div className="flex-1">
                                        <p className="text-black"><strong>Company:</strong> {exp.company}</p>
                                        <p className="text-black"><strong>Title:</strong> {exp.title}</p>
                                        <p className="text-black"><strong>Start Date:</strong> {formatDate(exp.startDate)}</p>
                                        <p className="text-black"><strong>End Date:</strong> {formatDate(exp.endDate)}</p>
                                    </div>
                                    <div className="flex-1 md:ml-4">
                                        <p className="text-black"><strong>Description:</strong></p>
                                        <p className="text-black">{exp.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-black">No experience details available.</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-black">
                        <FaTools className="inline-block mr-2" /> Skills
                    </h2>
                    {user.data.skills && user.data.skills.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.data.skills.map((skill, index) => (
                                <span key={index} className="bg-gray-200 px-2 py-1 rounded">{skill}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-black">No skills available.</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-black">
                        <FaFileAlt className="inline-block mr-2" /> Resume
                    </h2>
                    {user.data.resume ? (
                        <a href={user.data.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Resume</a>
                    ) : (
                        <p className="text-black">No resume available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;