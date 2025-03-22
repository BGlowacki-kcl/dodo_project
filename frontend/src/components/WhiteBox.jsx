import React from "react";

const WhiteBox = ({ children, className }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}> {/* Reduced padding from p-6 to p-4 */}
    {children}
  </div>
);

export default WhiteBox;
