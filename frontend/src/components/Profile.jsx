import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';

const Profile = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await userService.getUserProfile();
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    if (!userData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                    <p className="text-blue-100 mt-2">{userData.email}</p>
                </div>

                {/* Contact Information */}
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="text-gray-800">{userData.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="text-gray-800">{userData.location}</p>
                        </div>
                    </div>
                </div>

                {/* Education Section */}
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Education</h2>
                    <div className="space-y-4">
                        {userData.education?.map((edu, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-800">{edu.institution}</h3>
                                <p className="text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Experience Section */}
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Experience</h2>
                    <div className="space-y-4">
                        {userData.experience?.map((exp, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-800">{exp.title}</h3>
                                <p className="text-gray-700">{exp.company}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(exp.startDate).getFullYear()} - {new Date(exp.endDate).getFullYear()}
                                </p>
                                <p className="mt-2 text-gray-600">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills Section */}
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {userData.skills?.map((skill, index) => (
                            <span 
                                key={index}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;