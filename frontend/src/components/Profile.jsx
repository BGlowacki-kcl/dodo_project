import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';

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
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error fetching user profile: {error.message}</p>;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p><strong>Name:</strong> {user.data.name}</p>
                    <p><strong>Email:</strong> {user.data.email}</p>
                    <p><strong>Phone Number:</strong> {user.data.phoneNumber}</p>
                    <p><strong>Location:</strong> {user.data.location}</p>
                    <p><strong>LinkedIn:</strong> <a href={user.data.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.linkedin}</a></p>
                    <p><strong>GitHub:</strong> <a href={user.data.github} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.github}</a></p>
                    <p><strong>Portfolio:</strong> <a href={user.data.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-500">{user.data.portfolio}</a></p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">Education</h2>
                    {user.data.education && user.data.education.length > 0 ? (
                        user.data.education.map((edu, index) => (
                            <div key={index} className="mb-2">
                                <p><strong>Institution:</strong> {edu.institution}</p>
                                <p><strong>Degree:</strong> {edu.degree}</p>
                                <p><strong>Field of Study:</strong> {edu.fieldOfStudy}</p>
                                <p><strong>Start Date:</strong> {formatDate(edu.startDate)}</p>
                                <p><strong>End Date:</strong> {formatDate(edu.endDate)}</p>
                            </div>
                        ))
                    ) : (
                        <p>No education details available.</p>
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">Experience</h2>
                    {user.data.experience && user.data.experience.length > 0 ? (
                        user.data.experience.map((exp, index) => (
                            <div key={index} className="mb-2">
                                <p><strong>Company:</strong> {exp.company}</p>
                                <p><strong>Title:</strong> {exp.title}</p>
                                <p><strong>Start Date:</strong> {formatDate(exp.startDate)}</p>
                                <p><strong>End Date:</strong> {formatDate(exp.endDate)}</p>
                                <p><strong>Description:</strong> {exp.description}</p>
                            </div>
                        ))
                    ) : (
                        <p>No experience details available.</p>
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">Skills</h2>
                    {user.data.skills && user.data.skills.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {user.data.skills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No skills available.</p>
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">Resume</h2>
                    {user.data.resume ? (
                        <a href={user.data.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Resume</a>
                    ) : (
                        <p>No resume available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;