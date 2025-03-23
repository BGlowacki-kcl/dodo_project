import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationById } from "../../services/applicationService";
import { useNotification } from "../../context/notification.context";
import WhiteBox from "../../components/WhiteBox";
import ExtractApplication from "../../components/ExtractApplication";

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
          <ExtractApplication
            coverLetter={coverLetter}
            questions={application.job?.questions || []}
            answers={application.answers || []}
            codeChallenge={application.codeChallenge}
          />
        </WhiteBox>
      </div>
    </div>
  );
};

export default SingleApplicationPage;
