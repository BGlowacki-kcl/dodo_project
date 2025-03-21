import React, { useEffect, useState } from "react";
import EmployerSideBar from "../../components/EmployerSideBar";
import { useNavigate, useParams } from "react-router-dom";

const ApplicantDetails = () => {
    const { applicantId } = useParams();
    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicantDetails = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`/api/application/byId?id=${applicantId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                const data = await response.json();
                console.log('Applicants data:', data.data); // Debug log 7

                
                
                if (data.success) {
                    const userResponse = await fetch(`/api/user/${applicantId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const userData = await userResponse.json();
                    console.log('User data:', userData.data); // Debug log 8
                    setApplicant({
                        ...data.data,
                        education: userData.data.education || [],
                        experience: userData.data.experience || [],
                        skills: userData.data.skills || [],
                        resume: userData.data.resume,
                        name: userData.data.name,
                        email: userData.data.email
                    });
                } else {
                    throw new Error(data.message || 'Failed to fetch applicant details');
                }
            } catch (error) {
                console.error('Error details:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (applicantId) {
            fetchApplicantDetails();
        }
    }, [applicantId]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            const response = await fetch(`/api/application/${applicant.applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                setApplicant(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            setError('Failed to update status');
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployerSideBar />

            <div className="flex-1 p-8 ml-64">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
                >
                    <span>← Back to Applicants</span>
                </button>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center">
                        <p className="text-gray-600">Loading applicant details...</p>
                    </div>
                ) : applicant ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info Card */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">{applicant.name}</h1>
                                    <p className="text-gray-600">{applicant.email}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleStatusUpdate('shortlisted')} 
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Shortlist
                                    </button>
                                    <button onClick={() => handleStatusUpdate('rejected')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {/* Cover Letter */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Cover Letter</h2>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-line">{applicant.coverLetter}</p>
                                </div>
                            </div>

                            {/* CV/Resume Section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Resume</h2>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-line">{applicant.resume}</p>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {applicant.skills?.map((skill, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                            <h2 className="text-xl font-semibold mb-4">Application Status</h2>
                            <div className={`text-lg font-medium ${
                                applicant.status === 'accepted' ? 'text-green-600' :
                                applicant.status === 'rejected' ? 'text-red-600' :
                                'text-blue-600'
                            }`}>
                                {applicant.status?.charAt(0).toUpperCase() + applicant.status?.slice(1)}
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                Applied on: {new Date(applicant.submittedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-600">
                        <p>No applicant details found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicantDetails;