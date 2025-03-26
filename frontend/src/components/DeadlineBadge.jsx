import React from "react";

const DeadlineBadge = ({ deadline }) => {
  if (!deadline) {
    return (
      <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg shadow-md">
        <span className="font-semibold text-gray-700 mr-2">Deadline:</span>
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-200 text-red-800">
          No deadline
        </span>
      </div>
    );
  }

  const deadlineDate = new Date(deadline);
  const currentDate = new Date();
  const isPastDeadline = deadlineDate <= currentDate;

  return (
    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg shadow-md">
      <span className="font-semibold text-gray-700 mr-2">Deadline:</span>
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${
          isPastDeadline
            ? "bg-red-200 text-red-800"
            : "bg-green-200 text-green-800"
        }`}
      >
        {deadlineDate.toLocaleDateString("en-GB")}
      </span>
    </div>
  );
};

export default DeadlineBadge;