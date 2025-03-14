import React from "react";

const AssessmentStatus = ({ status }) => {
    const iconStyle = {
        fontSize: "2rem", // Adjust size here (e.g., 3rem, 40px)
      };
  const getStatusIcon = () => {
    switch (status) {
      case "completed-full":
        return <span style={iconStyle} title="Completed (Full Marks)">✅</span>;
      case "completed-partial":
        return <span style={iconStyle} title="Completed (Not Full Marks)">🟡</span>;
      case "attempted":
        return <span style={iconStyle} title="Attempted (Not Submitted)">📝</span>;
      case "not-submitted":
      default:
        return <span style={iconStyle} title="Not Submitted">⛔</span>;
    }
  };

  return <div>{getStatusIcon()}</div>;
};

export default AssessmentStatus;