import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApplicationById, updateStatus } from "../../services/applicationService";
import { userService } from "../../services/user.service";
import ApplicationDetails from "../../components/ApplicationDetails"; // Updated import
import WhiteBox from "../../components/WhiteBox";
import UserDetails from "../../components/UserDetails";

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

                if (!response) {
                    throw new Error("No application data returned");
                }

                setApplicant({
                    id: response.id,
                    name: response.applicant?.name || "No name provided",
                    email: response.applicant?.email || "No email provided",
                    phoneNumber: response.applicant?.phoneNumber || "No phone number provided",
                    location: response.applicant?.location || "No location provided",
                    skills: response.applicant?.skills || [],
                    resume: response.applicant?.resume || "No resume available",
                    education: response.applicant?.education || [],
                    experience: response.applicant?.experience || [],
                    status: response.status || "Applied",
                    coverLetter: response.coverLetter || "No cover letter provided",
                    submittedAt: response.submittedAt || new Date().toISOString(),
                    answers: response.answers || [],
                    questions: response.job?.questions || [],
                });
                console.log("Applicant details:", response);
            } catch (error) {
                console.error("Error fetching application details:", error);
                setError(`Failed to load application: ${error.message || "Unknown error"}`);
            } finally {
                setLoading(false);
            }
        };

        if (applicationId) {
            fetchApplicantDetails();
        } else {
            setError("No application ID provided");
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

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {applicant ? (
                    <div className="mt-8">
                        <UserDetails
                            user={applicant} // Ensure this is passed correctly
                            editable={false}
                        />
                        <ApplicationDetails
                            coverLetter={applicant.coverLetter}
                            questions={applicant.questions || []}
                            answers={applicant.answers || []}
                            codeChallenge={codeChallenge}
                        />
                    </div>
                ) : (
                    <div className="text-center text-gray-600">
                        <p>No application details found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicantDetails;