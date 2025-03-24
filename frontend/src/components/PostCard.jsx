import React from "react";
import WhiteBox from "./WhiteBox";
import { useNavigate } from "react-router-dom";

const PostCard = ({ title, type, location, totalApplicants, pendingApplicants, jobId }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    console.log(`Navigating to /employer/posts/${jobId}`);
    navigate(`/employer/posts/${jobId}`);
  };

  return (
    <WhiteBox
      className="flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      {/* Left Section: Job Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Type:</span> {type}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Location:</span> {location}
        </p>
      </div>

      {/* Right Section: Statistics */}
      <div className="text-right">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Total Applicants:</span> {totalApplicants}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Pending Applicants:</span> {pendingApplicants}
        </p>
      </div>
    </WhiteBox>
  );
};

export default PostCard;
