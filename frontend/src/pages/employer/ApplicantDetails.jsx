import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApplicationById, updateStatus } from "../../services/applicationService";
import { userService } from "../../services/user.service";
import ExtractApplication from "../../components/ExtractApplication";
import WhiteBox from "../../components/WhiteBox";

const ApplicantDetails = () => {
    const { applicationId } = useParams();
    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [codeChallenge, setCodeChallenge] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicantDetails = async () => {
            try {
                const response = await getApplicationById(applicationId);
                const applicantId = response.applicantid;
                const userResponse = await userService.getUserById(applicantId);

                setCodeChallenge(response.assessments);

                if (!response && !userResponse) {
                    throw new Error('No application data returned');
                }

                setApplicant({
                    id: response._id,
                    applicationId: response._id,
                    name: response.name || 'No name provided',
                    email: response.email || 'No email provided',
                    status: response.status || 'Applied',
                    coverLetter: response.coverLetter || 'No cover letter provided',
                    submittedAt: response.submittedAt || new Date().toISOString(),
                    skills: userResponse.skills || [],
                    resume: userResponse.resume || 'No resume available',
                    answers: response.answers || [],
                    questions: response.job.questions || [],
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

    const getButtonState = (status) => {
        let shortlistCaption = "Shortlist";
        let rejectCaption = "Reject";
        let isShortlistDisabled = false;
        let isRejectDisabled = false;

        switch (status) {
            case 'Applying':
            case 'Accepted':
            case 'Rejected':
                isShortlistDisabled = true;
                isRejectDisabled = true;
                break;

            case 'Code Challenge':
                shortlistCaption = "In Code Challenge";
                isShortlistDisabled = true;
                isRejectDisabled = true;
                break;

            case 'Shortlisted':
                shortlistCaption = "Move to Code Challenge";
                break;

            case 'In Review':
                shortlistCaption = "Accept";
                break;

            default:
                break;
        }

        return { shortlistCaption, rejectCaption, isShortlistDisabled, isRejectDisabled };
    };

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        try {
            if (!applicationId) throw new Error('Application ID not available');

            await updateStatus(applicationId, newStatus === 'Rejected');

            setApplicant((prev) => ({
                ...prev,
                status: newStatus,
            }));
            window.location.reload();

        } catch (error) {
            console.error('Error updating status:', error);
            setError(`Failed to update status: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicant?.status) {
            console.log('Application status updated to:', applicant.status);
        }
    }, [applicant?.status]);

    const { shortlistCaption, rejectCaption, isShortlistDisabled, isRejectDisabled } = getButtonState(applicant?.status);

    if (loading) {
        return (
            <div className="bg-slate-900 min-h-screen flex items-center justify-center">
                <p className="text-white">Loading applicant details...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex-1 p-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-left text-black">Applicant Details</h1>
                    {/* Removed Back Button */}
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {applicant ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info Section */}
                        <WhiteBox className="lg:col-span-2">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{applicant.name}</h2>
                                    <p className="text-gray-600">{applicant.email}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleStatusUpdate('shortlisted')}
                                        disabled={isShortlistDisabled}
                                        className={`px-4 py-2 ${isShortlistDisabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg`}
                                    >
                                        {shortlistCaption}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={isRejectDisabled}
                                        className={`px-4 py-2 ${isRejectDisabled ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} text-white rounded-lg`}
                                    >
                                        {rejectCaption}
                                    </button>
                                </div>
                            </div>
                        </WhiteBox>

                        {/* Status Section */}
                        <WhiteBox>
                            <h2 className="text-xl font-semibold mb-4">Application Status</h2>
                            <div className={`text-lg font-medium ${
                                applicant.status === 'Accepted' ? 'text-green-600' :
                                applicant.status === 'Rejected' ? 'text-red-600' :
                                'text-blue-600'
                            }`}>
                                {applicant.status?.charAt(0).toUpperCase() + applicant.status?.slice(1)}
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                Applied on: {new Date(applicant.submittedAt).toLocaleDateString()}
                            </div>
                        </WhiteBox>

                        {/* Skills Section */}
                        <WhiteBox>
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
                        </WhiteBox>

                        {/* Resume Section */}
                        <WhiteBox>
                            <h2 className="text-xl font-semibold mb-4">Resume</h2>
                            {applicant.resume && applicant.resume !== 'No resume available' ? (
                                <div className="bg-gray-50 p-4 rounded-lg">
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
                            ) : (
                                <p className="text-gray-500 italic">No resume available</p>
                            )}
                        </WhiteBox>

                        {/* ExtractApplication Component */}
                        <div className="lg:col-span-3">
                            <ExtractApplication
                                coverLetter={applicant.coverLetter}
                                questions={applicant.questions || []}
                                answers={applicant.answers || []}
                                codeChallenge={codeChallenge}
                            />
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