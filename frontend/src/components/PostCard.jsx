import React from "react";
import WhiteBox from "./WhiteBox";
import { useNavigate } from "react-router-dom";

const PostCard = ({ title, type, location, totalApplicants, pendingApplicants, statusBreakdown, jobId }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/employer/post/${jobId}`); // Navigate to the specific job's statistics page
  };

  // Define the desired order of statuses
  const statusOrder = ["Applied", "Shortlisted", "Code Challenge", "In Review", "Rejected", "Accepted"];

  // Sort the statusBreakdown array based on the defined order
  const sortedStatuses = statusBreakdown
    .filter((status) => status.status !== "Applying") // Exclude "Applying" status
    .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

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

      {/* Right Section: Statistics */}
      <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:space-x-4 ml-auto">
        <div className="bg-gray-100 p-4 rounded shadow text-center">
          <p className="text-sm font-semibold text-black">Pending Applicants</p>
          <p className="text-xl font-bold text-black">{pendingApplicants}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded shadow text-center">
          <p className="text-sm font-semibold text-black">Total Applicants</p>
          <p className="text-xl font-bold text-black">{totalApplicants}</p>
        </div>
      </div>
    </WhiteBox>
  );
};

export default PostCard;