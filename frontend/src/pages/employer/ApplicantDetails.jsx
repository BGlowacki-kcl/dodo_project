/**
 * ApplicantDetails.jsx
 *
 * This component represents the Applicant Details page in the application. It provides:
 * - Detailed information about a specific applicant and their application.
 * - Options to update the application status (e.g., Shortlist, Reject).
 * - Displays user details, application details, and status badges.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApplicationById, updateStatus } from "../../services/application.service.js";
import ApplicationDetails from "../../components/ApplicationDetails";
import UserDetails from "../../components/UserDetails";
import StatusBadge from "../../components/StatusBadge";

const ApplicantDetails = () => {
  // ----------------------------- State Variables -----------------------------
  const { applicationId } = useParams();
  const [applicant, setApplicant] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [codeChallenge, setCodeChallenge] = useState(null); 
  const navigate = useNavigate();

  // ----------------------------- Effects -----------------------------
  useEffect(() => {
    if (applicationId) {
      fetchApplicantDetails();
    } else {
      setError("No application ID provided");
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (applicant?.status) {
      // Removed console.log for status updates
    }
  }, [applicant?.status]);

  // ----------------------------- Data Fetching -----------------------------
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

      setCodeChallenge(response.assessments || null);
    } catch (error) {
      console.error("Error fetching application details:", error);
      setError(`Failed to load application: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- Helpers -----------------------------
  /**
   * Determines the button captions and disabled states based on the application status.
   * @param {string} status - The current application status.
   * @returns {Object} - Button captions and disabled states.
   */
  const getButtonState = (status) => {
    let shortlistCaption = "Shortlist";
    let rejectCaption = "Reject";
    let isShortlistDisabled = false;
    let isRejectDisabled = false;

    switch (status) {
      case "Applying":
      case "Accepted":
      case "Rejected":
        isShortlistDisabled = true;
        isRejectDisabled = true;
        break;

      case "Code Challenge":
        shortlistCaption = "In Code Challenge";
        isShortlistDisabled = true;
        isRejectDisabled = true;
        break;

      case "Shortlisted":
        if (codeChallenge?.assessments?.length > 0) {
          shortlistCaption = "Move to Code Challenge";
        } else{
          shortlistCaption = "Move to In Review";

        }
        break;

      case "In Review":
        shortlistCaption = "Accept";
        break;

      default:
        break;
    }

    return { shortlistCaption, rejectCaption, isShortlistDisabled, isRejectDisabled };
  };

  /**
 * Updates the application status and reloads the page.
 * @param {string} newStatus - The new status to set.
 */
const handleStatusUpdate = async (newStatus) => {
  setLoading(true);
  try {
    if (!applicationId) throw new Error("Application ID not available");

    // Determine if this is a rejection operation
    const isRejection = newStatus.toLowerCase() === "rejected";
    
    // Call updateStatus with the correct parameters:
    // - applicationId: The ID of the application
    // - isRejection: true if rejecting, false if shortlisting/accepting
    await updateStatus(applicationId, isRejection);
    
    setApplicant((prev) => ({
      ...prev,
      status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1), // Capitalize for consistent display
    }));
    window.location.reload();
  } catch (error) {
    console.error("Error updating status:", error);
    setError(`Failed to update status: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // ----------------------------- Render -----------------------------
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-left text-black">Applicant Details</h1>
          <StatusBadge
            status={applicant?.status}
            size="w-70 h-10"
            fontSize="text-xl"
            padding="px-20 py-5"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* Applicant Details */}
        {applicant ? (
          <div className="space-y-8">
            <UserDetails user={applicant} editable={false} />
            <ApplicationDetails
              coverLetter={applicant.coverLetter}
              questions={applicant.questions || []}
              answers={applicant.answers || []}
              codeAssessment={codeChallenge} // Corrected spelling
              showCodeAssessment={
                applicant.status === "Accepted" ||
                applicant.status === "In Review" ||
                applicant.status === "Rejected"
              }
            />
            {applicant.status !== "Accepted" && applicant.status !== "Rejected" && (
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleStatusUpdate("shortlisted")}
                  disabled={isShortlistDisabled}
                  className={`px-4 py-2 ${
                    isShortlistDisabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-lg`}
                >
                  {shortlistCaption}
                </button>
                <button
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={isRejectDisabled}
                  className={`px-4 py-2 ${
                    isRejectDisabled ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                  } text-white rounded-lg`}
                >
                  {rejectCaption}
                </button>
              </div>
            )}
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