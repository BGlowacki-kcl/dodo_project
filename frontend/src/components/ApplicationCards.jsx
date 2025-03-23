import React from "react";
import { useNavigate } from "react-router-dom";

const ApplicationCards = ({ applications }) => {
  const navigate = useNavigate();

  const handleCardClick = (app) => {
    if (app.status === "Applying") {
      navigate(`/apply/${app.job._id}`);
    } else {
      navigate(`/user/applications/${app._id}`);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Applied":
        return "bg-blue-700 text-white"; // Darker blue with white text
      case "In Review":
        return "bg-blue-500 text-white";
      case "Shortlisted":
        return "bg-yellow-500 text-white";
      case "Rejected":
        return "bg-red-500 text-white";
      case "Code Challenge":
        return "bg-orange-500 text-white";
      case "Accepted":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " " + new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app._id}
          className="border border-gray-300 rounded-lg shadow-md p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer flex items-center"
          onClick={() => handleCardClick(app)}
        >
          <div className="flex-1">
            {/* Job Title */}
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {app.job?.title || "Untitled Job"}
            </h3>

            {/* Company Name */}
            <p className="text-sm text-gray-600 mb-2">
              {app.job?.company || "Unknown Company"}
            </p>

            {/* Submission Date */}
            <p className="text-sm text-gray-500">
              <strong>Submitted:</strong> {formatDate(app.submittedAt)}
            </p>
          </div>

          {/* Status */}
          <div
            className={`ml-4 px-4 py-2 text-sm font-semibold rounded-lg text-center ${getStatusBadgeClass(app.status)}`}
            style={{ minWidth: "150px" }} // Ensure consistent badge width
          >
            {app.status}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationCards;