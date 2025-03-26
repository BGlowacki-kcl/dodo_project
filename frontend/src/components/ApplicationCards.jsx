import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const ApplicationCards = ({ applications }) => {
  const navigate = useNavigate();

  const handleCardClick = (app) => {
    if (app.status === "Applying") {
      navigate(`/apply/${app.job._id}`);
    } else {
      navigate(`/user/applications/${app._id}`);
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
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {app.job?.title || "Untitled Job"}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {app.job?.company || "Unknown Company"}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Submitted:</strong> {formatDate(app.submittedAt)}
            </p>
          </div>
          <StatusBadge status={app.status} size="w-40 h-6" fontSize="text-sm" padding="px-15 py-5" />
        </div>
      ))}
    </div>
  );
};

export default ApplicationCards;