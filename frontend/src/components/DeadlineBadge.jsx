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

  // Calculate the difference in days between the current date and the deadline
  const timeDifference = deadlineDate - currentDate;
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  const isPastDeadline = daysDifference < 0;
  const isOneWeekBefore = daysDifference === 7;

  return (
    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg shadow-md">
      <span className="font-semibold text-gray-700 mr-2">Deadline:</span>
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full ${
          isPastDeadline
            ? "bg-red-200 text-red-800"
            : isOneWeekBefore
            ? "bg-orange-200 text-orange-800"
            : "bg-green-200 text-green-800"
        }`}
        title={
          isPastDeadline
            ? `Deadline was: ${deadlineDate.toLocaleDateString("en-GB")}`
            : `${daysDifference} day${daysDifference === 1 ? "" : "s"} left until the deadline`
        }
      >
        {isPastDeadline
          ? "Deadline Passed"
          : isOneWeekBefore
          ? "1 Week Remaining"
          : deadlineDate.toLocaleDateString("en-GB")}
      </span>
    </div>
  );
};

export default DeadlineBadge;