/**
 * WhiteBox.jsx
 *
 * This component provides a reusable white container with rounded corners and a shadow.
 * - Supports custom styles and click functionality.
 * - Can be used as a wrapper for other components or content.
 */

import React from "react";

const WhiteBox = ({ children, className = "", onClick }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-sm ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export default WhiteBox;