/**
 * PostCard.jsx
 *
 * This component represents a card displaying job post details.
 * - Displays job title, type, location, and application statistics.
 * - Includes a status breakdown table and a deadline badge.
 * - Navigates to the job's statistics page when clicked.
 */

import React from "react";
import WhiteBox from "./WhiteBox";
import { useNavigate } from "react-router-dom";
import DeadlineBadge from "./DeadlineBadge";

const PostCard = ({
  title,
  type,
  location,
  totalApplicants,
  pendingApplicants,
  statusBreakdown,
  jobId,
  deadline,
}) => {
  const navigate = useNavigate();

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles the card click event to navigate to the job's statistics page.
   */
  const handleCardClick = () => {
    navigate(`/employer/post/${jobId}`);
  };

  // ----------------------------- Helpers -----------------------------
  /**
   * Defines the desired order of statuses and sorts the status breakdown array.
   * @returns {Array} - Sorted status breakdown array.
   */
  const getSortedStatuses = () => {
    const statusOrder = [
      "Applied",
      "Shortlisted",
      "Code Challenge",
      "In Review",
      "Rejected",
      "Accepted",
    ];
    return statusBreakdown
      .filter((status) => status.status !== "Applying") // Exclude "Applying" status
      .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
  };

  const sortedStatuses = getSortedStatuses();

  // ----------------------------- Render -----------------------------
  return (
    <WhiteBox
      className="flex flex-col md:flex-row justify-between items-center cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      {/* Left Section: Job Details */}
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-black">{title}</h3>
        <p className="text-sm text-black">
          <span className="font-semibold">Type:</span> {type}
        </p>
        <p className="text-sm text-black">
          <span className="font-semibold">Location:</span> {location}
        </p>
      </div>

      {/* Center Section: Status Breakdown Table */}
      <div className="flex justify-center items-center mt-4 w-1/2">
        <table className="table-auto border-collapse border border-gray-300 w-3/4 text-sm bg-white shadow-lg rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-black">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-semibold text-black">Count</th>
            </tr>
          </thead>
          <tbody>
            {sortedStatuses.map((status) => (
              <tr key={status.status} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{status.status}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{status.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Section: Deadline Badge and Applicants */}
      <div className="flex flex-col items-center ml-auto">
        {/* Deadline Badge with extra bottom margin */}
        <div className="mb-8">
          <DeadlineBadge deadline={deadline} />
        </div>
        <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:space-x-4">
          <div className="bg-gray-100 p-4 rounded shadow text-center">
            <p className="text-sm font-semibold text-black">Pending Applicants</p>
            <p className="text-xl font-bold text-black">{pendingApplicants}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow text-center">
            <p className="text-sm font-semibold text-black">Total Applicants</p>
            <p className="text-xl font-bold text-black">{totalApplicants}</p>
          </div>
        </div>
      </div>
    </WhiteBox>
  );
};

export default PostCard;