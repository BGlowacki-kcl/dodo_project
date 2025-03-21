import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationById, withdrawApplication } from "../../services/applicationService";
import { useNotification } from "../../context/notification.context";

/* 
  SingleApplicationPage:
  This page displays details of a specific job application.
  It fetches application data based on the application ID retrieved from the URL.
*/
function SingleApplicationPage() {
  const { appId } = useParams(); // Get application ID from URL parameters
  const navigate = useNavigate(); // Hook for navigation
  const [application, setApplication] = useState(null); // State to store application details
  const hasFetched = useRef(false); // Ref to prevent multiple fetches
  const [codeChallenge, setCodeChallenge] = useState(false); // State to track if the application requires a code challenge
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const showNotification = useNotification();

  // Fetches application details
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchApp();
  
  }, [appId, navigate]);


  const fetchApp = async () => {
    try {
      const response = await getApplicationById(appId);
      console.log('Full response:', response);
      
      if (!response) {
        console.error('Unexpected response structure:', response);
        showNotification("Failed to fetch application");
        navigate("/applicant-dashboard");
        return;
      }
      
      setApplication(response);

      setCodeChallenge(response.status == "code challenge");

    } catch (error) {
      console.error('Error fetching application:', error);
      showNotification("Failed to fetch application");
      navigate("/applicant-dashboard");
    }
  }

    const handleAssessment = async () => {
      const userConfirmed = window.confirm("Are you sure you want to proceed to the code assessment?");
      if (!userConfirmed) return;
      navigate(`/codeassessment/${appId}`);
    }
    
    // Handle withdrawal of application
    const handleWithdraw = async () => {
      try {
        const message = await withdrawApplication(appId); // Use the updated service
        showNotification(message, "success"); // Show success notification
        navigate("/applicant-dashboard");
      } catch (err) {
        console.error(err);
        showNotification(err.message || "Failed to withdraw application.", "error"); // Show error notification
      } finally {
        setShowModal(false); // Close the modal after the action
      }
    };

    // Helper function to return appropriate badge color for application status
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case "applied":
          return "bg-yellow-500";
        case "in review":
          return "bg-blue-500";
        case "shortlisted":
          return "bg-purple-500";
        case "rejected":
          return "bg-red-500";
        case "code challenge":
          return "bg-orange-500";
        case "hired":
          return "bg-green-500";
        default:
          return "bg-gray-500";
      }
    };

    // Show loading message while fetching application data
    if (!application) {
      return (
        <div className="bg-slate-900 min-h-screen flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      );
    }

    const { job, status, coverLetter, submittedAt } = application;
    const formattedDate = new Date(submittedAt).toLocaleString();

    return (
      <div className="bg-slate-900 min-h-screen w-full flex flex-col items-center px-4 py-8">
        <div className="max-w-xl w-full bg-white p-6 rounded-md shadow-md">
          <h1 className="text-2xl font-bold mb-4">Application Details</h1>
          {/* JOB TITLE */}
          <p className="text-lg font-semibold text-gray-700 mb-2">
            {job?.title || "Untitled Job"}
          </p>

          {/* STATUS WITH BADGE */}
          <div className="flex items-center mb-2">
            <span className="mr-2 font-medium text-gray-600">Status:</span>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-md ${getStatusBadgeClass(
                status
              )}`}
            >
              {status}
            </span>
          </div>

          {/* COVER LETTER */}
          <div className="mb-2">
            <p className="font-medium text-gray-600">Cover Letter:</p>
            <p className="text-gray-800">{coverLetter || "N/A"}</p>
          </div>

          {/* SUBMITTED AT */}
          <div className="mb-2">
            <p className="font-medium text-gray-600">Submitted At:</p>
            <p className="text-gray-800">{formattedDate}</p>
          </div>

          {/* EXTRA DETAILS HERE (could also show job.requirements, job.salaryRange, etc.) */}
          {job?.location && (
            <div className="mb-2">
              <p className="font-medium text-gray-600">Job Location:</p>
              <p className="text-gray-800">{job.location}</p>
            </div>
          )}

          {/* ACTION BUTTONS! */}
          <div className="flex items-center space-x-4 mt-6">
            {/* Can link to another more detailed job details page */}
            {job?._id && (
              <button
                onClick={() => navigate(`/user/jobs/details/${job._id}`)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200"
              >
                View Job Details
              </button>
            )}

            {codeChallenge && (
              <button
                onClick={handleAssessment}
                className="px-4 py-2 bg-green-300 text-gray-800 rounded hover:bg-green-500 transition duration-200"
              >
                Proceed to assessment
              </button>
            )}

            {/* WITHDRAW APPLICATION */}
            <button
              onClick={() => setShowModal(true)} // Open the modal
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
            >
              Withdraw
            </button>
          </div>

          {/* BACK LINK */}
          <div className="mt-6">
            <button
              onClick={() => navigate("/applicant-dashboard")}
              className="text-blue-600 hover:underline"
            >
              &larr; Back to My Applications
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Confirm Withdrawal</h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to withdraw this application? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)} // Close the modal
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw} // Proceed with withdrawal
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default SingleApplicationPage;
