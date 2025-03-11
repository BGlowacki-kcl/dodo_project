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
    const { appId } = useParams();    // Get application ID from URL parameters
    const navigate = useNavigate();    // Hook for navigation
    const [application, setApplication] = useState(null);    // State to store application details
    const hasFetched = useRef(false);    // Ref to prevent multiple fetches
    const [codeChallenge, setCodeChallenge] = useState(false);    // State to track if the application requires a code challenge
    const showNotification = useNotification();

    // Fetches application details
    useEffect(() => {
        async function fetchApp() {
          if (hasFetched.current) return;
          hasFetched.current = true;
          // Fetch application data from API
          const data = await getApplicationById(appId);
          setApplication(data.data);
          console.log(data.data);
          // Check if the application status requires a code challenge
          if(data.data && data.data.status == "code challenge") {
            setCodeChallenge(true);
          }
          // Handle unauthorized or failed fetch scenarios
          if (data.status && data.status == 403) {
              showNotification(data.message);
              navigate("/user/applications");
              return;
          }
          if(data.status && data.status != 200) {
            showNotification("Failed to fetch application");
            navigate("/user/applications");
            return;
          }    
          setApplication(data.data);
        }
        fetchApp();
    }, [appId, navigate]);

    // Handle withdrawal of application
    const handleWithdraw = async () => {
        if (!window.confirm("Are you sure you want to withdraw this application?")) {
            return;
        }
        try {
            await withdrawApplication(appId);
            alert("Application withdrawn successfully!");
            navigate("/user/applications");
        } 
        catch (err) {
            console.error(err);
            alert("Failed to withdraw application.");
        }
    };
    ////// Helper function to return appropriate badge color for application status
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
                <p className="text-lg font-semibold text-gray-700 mb-2"> {job?.title || "Untitled Job"} </p>

                {/* STATUS WITH BADGE */}
                <div className="flex items-center mb-2">
                <span className="mr-2 font-medium text-gray-600">Status:</span>
                <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-md ${getStatusBadgeClass( status )}`} > {status} </span>
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
                    <button onClick={() => navigate(`/user/jobs/details/${job._id}`)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200" > View Job Listing </button>
                )}

                {codeChallenge && (
                    <button onClick={() => navigate(`/codeassessment/${appId}`)} className="px-4 py-2 bg-green-300 text-gray-800 rounded hover:bg-green-500 transition duration-200" > Proceed to assessment </button>
                )}

                {/* WITHDRAW APPLICATION */}
                <button onClick={handleWithdraw} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200" > Withdraw </button>
                </div>

                {/* BACK LINK */}
                <div className="mt-6">
                <button onClick={() => navigate("/user/applications")} className="text-blue-600 hover:underline" > &larr; Back to My Applications </button>
                </div>
      </div>
    </div>
  );
}

export default SingleApplicationPage;
