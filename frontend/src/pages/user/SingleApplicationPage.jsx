import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationById } from "../../services/applicationService";
import { useNotification } from "../../context/notification.context";
import WhiteBox from "../../components/WhiteBox";

const SingleApplicationPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const hasFetched = useRef(false);
  const [codeChallenge, setCodeChallenge] = useState(false);
  const showNotification = useNotification();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchApp();
  }, [appId, navigate]);

  const fetchApp = async () => {
    try {
      const response = await getApplicationById(appId);
      if (!response) {
        showNotification("Failed to fetch application");
        navigate("/applicant-dashboard");
        return;
      }

      setApplication(response);
      setCodeChallenge(response.status === "Code Challenge");
    } catch (error) {
      console.error("Error fetching application:", error);
      showNotification("Failed to fetch application");
      navigate("/applicant-dashboard");
    }
  };

  const handleAssessment = () => {
    const userConfirmed = window.confirm("Are you sure you want to proceed to the code assessment?");
    if (!userConfirmed) return;
    navigate(`/codeassessment/${appId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Applied":
        return "bg-yellow-500";
      case "In Review":
        return "bg-blue-500";
      case "Shortlisted":
        return "bg-purple-500";
      case "Rejected":
        return "bg-red-500";
      case "Code Challenge":
        return "bg-orange-500";
      case "Accepted":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

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
    <div className="container mx-auto p-4 font-sans">
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-left">Application Details</h1>
          <span
            className={`px-6 py-3 text-lg font-semibold rounded-lg ${getStatusBadgeClass(status)}`}
          >
            {status}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Job Title */}
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Job Title</h3>
            <p>{job?.title || "Untitled Job"}</p>
          </WhiteBox>

          {/* Job Company */}
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Job Company</h3>
            <p>{job?.company || "Unknown Company"}</p>
          </WhiteBox>

          {/* Date of Submission */}
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Date of Submission</h3>
            <p>{formattedDate}</p>
          </WhiteBox>
        </div>

        {/* Main Info Card */}
        <WhiteBox className="w-full mt-6">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">Cover Letter</h3>
            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{coverLetter || "N/A"}</pre>
          </div>
          {/* Questions and Answers Section */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">Questions and Answers</h3>
            {application.answers.length > 0 ? (
              <ul className="list-disc pl-6">
                {application.answers.map((answer, index) => (
                  <li key={index} className="mb-4">
                    <p className="font-medium">Question:</p>
                    <p>{answer.questionText}</p>
                    <p className="font-medium mt-2">Answer:</p>
                    <p>{answer.answerText}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No questions answered.</p>
            )}
          </div>
          {codeChallenge && (
            <button
              onClick={handleAssessment}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
            >
              Proceed to Assessment
            </button>
          )}
        </WhiteBox>
      </div>
    </div>
  );
};

export default SingleApplicationPage;
