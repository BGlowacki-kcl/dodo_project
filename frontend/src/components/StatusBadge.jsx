/**
 * StatusBadge.jsx
 *
 * This component displays a badge with a status label.
 * - The badge color changes based on the status.
 * - Supports optional click functionality and customizable styles.
 */

import React from "react";

const StatusBadge = ({
  status,
  onClick,
  className = "",
  size = "w-24 h-8",
  fontSize = "text-lg",
  padding = "px-4 py-2",
}) => {
  // ----------------------------- Helpers -----------------------------
  /**
   * Returns the appropriate CSS class for the badge based on the status.
   * @param {string} status - The status to determine the badge color.
   * @returns {string} - The CSS class for the badge color.
   */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Applied":
        return "bg-yellow-500";
      case "In Review":
        return "bg-blue-500";
      case "Shortlisted":
        return "bg-purple-500";
      case "Rejected":
        return "bg-red-500";
      case "Code Challenge":
        return "bg-orange-500";
      case "Accepted":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // ----------------------------- Render -----------------------------
  return (
    <span
      className={`${size} ${padding} ${fontSize} flex items-center justify-center font-semibold rounded-lg ${getStatusBadgeClass(status)} ${className} ${
        onClick ? "cursor-pointer hover:opacity-80" : ""
      }`}
      onClick={onClick}
    >
      {status}
    </span>
  );
};

export default StatusBadge;