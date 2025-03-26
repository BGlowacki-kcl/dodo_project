/**
 * AssessmentStatus.jsx
 *
 * This component displays the status of an assessment with an icon and title.
 * - The status determines the icon and tooltip displayed.
 * - Clicking on the component triggers the provided `onClick` handler unless it is chosen.
 */

import React from "react";

const AssessmentStatus = ({ status, onClick, chosen, title }) => {
  // ----------------------------- Styles -----------------------------
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: chosen ? "default" : "pointer",
    color: "white",
    backgroundColor: chosen ? "grey" : "transparent",
    border: chosen ? "1px solid white" : "none",
    padding: "10px",
    borderRadius: "8px",
  };

  const iconStyle = {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  };

  const titleStyle = {
    fontSize: "1.5rem",
    textAlign: "center",
  };

  // ----------------------------- Helpers -----------------------------
  /**
   * Returns the appropriate JSX for the assessment status.
   * @returns {JSX.Element} - The JSX for the status icon and title.
   */
  const getStatusIcon = () => {
    switch (status) {
      case "completed-full":
        return (
          <div
            style={containerStyle}
            onClick={chosen ? undefined : onClick}
            title="Completed (Full Marks)"
          >
            <span style={iconStyle}>✅</span>
            <span style={titleStyle}>{title}</span>
          </div>
        );
      case "completed-partial":
        return (
          <div
            style={containerStyle}
            onClick={chosen ? undefined : onClick}
            title="Completed (Not Full Marks)"
          >
            <span style={iconStyle}>🟡</span>
            <span style={titleStyle}>{title}</span>
          </div>
        );
      case "attempted":
        return (
          <div
            style={containerStyle}
            onClick={chosen ? undefined : onClick}
            title="Attempted (Not Submitted)"
          >
            <span style={iconStyle}>📝</span>
            <span style={titleStyle}>{title}</span>
          </div>
        );
      case "not-submitted":
      default:
        return (
          <div
            style={containerStyle}
            onClick={chosen ? undefined : onClick}
            title="Not Submitted"
          >
            <span style={iconStyle}>🔍</span>
            <span style={titleStyle}>{title}</span>
          </div>
        );
    }
  };

  // ----------------------------- Render -----------------------------
  return getStatusIcon();
};

export default AssessmentStatus;