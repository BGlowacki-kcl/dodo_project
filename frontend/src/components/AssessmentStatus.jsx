import React from "react";

const AssessmentStatus = ({ status, key, onClick, title }) => {
    const iconStyle = {
        fontSize: "2rem", // Adjust size here (e.g., 3rem, 40px)
        cursor: "pointer"
      };
  const getStatusIcon = () => {
    switch (status) {
      case "completed-full":
        return <span style={iconStyle} onClick={onClick} key={key} title="Completed (Full Marks)">✅ {title}</span>;
      case "completed-partial":
        return <span style={iconStyle} onClick={onClick} key={key} title="Completed (Not Full Marks)">🟡 {title}</span>;
      case "attempted":
        return <span style={iconStyle} onClick={onClick} key={key} title="Attempted (Not Submitted)">📝 {title}</span>;
      case "not-submitted":
      default:
        return <span style={iconStyle} onClick={onClick} key={key} title="Not Submitted">🔍 {title}</span>;
    }
  };

  return <div>{getStatusIcon()}</div>;
};

export default AssessmentStatus;