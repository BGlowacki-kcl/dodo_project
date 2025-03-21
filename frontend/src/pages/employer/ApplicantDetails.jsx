import React, { useEffect, useState } from "react";
import EmployerSideBar from "../../components/EmployerSideBar";
import { useNavigate, useParams } from "react-router-dom";
import { getApplicationById, updateStatus } from "../../services/applicationService";
//
// 
import { userService } from "../../services/user.service";

const ApplicantDetails = () => {
    const { applicationId } = useParams();
    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [codeChallenge, setCodeChallenge] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicantDetails = async () => {
            try {
                
                console.log('Fetching application with ID:', applicationId);
                
                const response = await getApplicationById(applicationId);
                
                console.log('Raw API response:', response);
                const applicantId = response.applicantid;
                console.log('Applicant ID:', applicantId);
                const userResponse = await userService.getUserById(applicantId);
                console.log('User response:', userResponse)
                
                
                
                
                if (!response && !userResponse) {
                    throw new Error('No application data returned');
                }
                
                
                setCodeChallenge(response.status === 'code challenge');
                
                // The response is already the data object, not wrapped in {success, data}
                setApplicant({
                    id: response._id,
                    applicationId: response._id,
                    name: response.name || 'No name provided',
                    email: response.email || 'No email provided',
                    status: response.status || 'applied',
                    coverLetter: response.coverLetter || 'No cover letter provided',
                    submittedAt: response.submittedAt || new Date().toISOString(),
                    skills: userResponse.skills || [],
                    resume: userResponse.resume || 'No resume available'
                });
            } catch (error) {
                console.error('Error fetching application details:', error);
                setError(`Failed to load application: ${error.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
            
        };
    
        if (applicationId) {
            fetchApplicantDetails();
        } else {
            setError('No application ID provided');
            setLoading(false);
        }
    }, [applicationId]);

    const handleStatusUpdate = async (newStatus) => {
        console.log('Applicant: ', applicationId);
        try {
            if (!applicationId) {
                throw new Error('Application ID not available');
            }
            if(newStatus === 'rejected'){
                updateStatus(applicationId, true);
            } else {
                updateStatus(applicationId, false);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError(`Failed to update status: ${error.message}`);
        }
    };

    // Rest of your component remains the same
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
                            
                            {/* Skills */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                                {applicant.skills && applicant.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {applicant.skills.map((skill, index) => (
                                            <span 
                                                key={index} 
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No skills listed</p>
                                )}
                            </div>
                            
                            {/* Resume */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Resume</h2>
                                {applicant.resume && applicant.resume !== 'No resume available' ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            
                                            {applicant.resume.startsWith('http') ? (
                                                <a 
                                                    href={applicant.resume} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    View Resume
                                                </a>
                                            ) : (
                                                <p className="text-gray-700 whitespace-pre-line">{applicant.resume}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No resume available</p>
                                )}
                            </div>

                            {/* Rest of your component remains the same */}
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