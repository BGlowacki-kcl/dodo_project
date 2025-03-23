import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationById } from "../../services/applicationService";
import { useNotification } from "../../context/notification.context";
import WhiteBox from "../../components/WhiteBox";
import ExtractApplication from "../../components/ExtractApplication";
import ModalMessages from "../../components/ModalMessages";

const SingleApplicationPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
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

      // Show modal only once per status
      const viewedStatuses = JSON.parse(localStorage.getItem("viewedStatuses")) || {};
      if (!viewedStatuses[response._id] || viewedStatuses[response._id] !== response.status) {
        setModalMessage(getModalMessage(response.status));
        setShowModal(true);
        viewedStatuses[response._id] = response.status;
        localStorage.setItem("viewedStatuses", JSON.stringify(viewedStatuses));
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      showNotification("Failed to fetch application");
      navigate("/applicant-dashboard");
    }
  };

  const getModalMessage = (status) => {
    switch (status) {
      case "Applied":
        return "Congratulations! Your application has been submitted successfully.";
      case "In Review":
        return "Your application is currently under review. Good luck!";
      case "Shortlisted":
        return "Great news! You have been shortlisted for the next stage.";
      case "Rejected":
        return "Unfortunately, your application was not successful this time. Keep trying!";
      case "Code Challenge":
        return "You have been invited to complete a code challenge. Click the orange button to proceed.";
      case "Accepted":
        return "Congratulations! Your application has been accepted.";
      default:
        return "Your application status has been updated.";
    }
  };

  const handleAssessment = () => {
    setShowAssessmentModal(true);
  };

  const confirmAssessmentNavigation = () => {
    setShowAssessmentModal(false);
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
      {/* Modal for status message */}
      <ModalMessages
        show={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
      />

      {/* Modal for assessment confirmation */}
      <ModalMessages
        show={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        message="Are you sure you want to proceed to the code assessment?"
        onConfirm={confirmAssessmentNavigation}
        confirmText="Yes"
        cancelText="No"
      />

      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-left">Application Details</h1>
          <span
            className={`px-6 py-3 text-lg font-semibold rounded-lg ${getStatusBadgeClass(status)} ${
              status === "Code Challenge" ? "cursor-pointer hover:opacity-80" : ""
            }`}
            onClick={status === "Code Challenge" ? handleAssessment : undefined}
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
