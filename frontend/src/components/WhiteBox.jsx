import React from "react";

const WhiteBox = ({ children, className, onClick }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-sm ${className}`}
    onClick={onClick}
    >
    {children}
  </div>
);

export default WhiteBox;