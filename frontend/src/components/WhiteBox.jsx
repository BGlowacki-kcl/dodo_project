import React from "react";

const WhiteBox = ({ children, className }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}> 
    {children}
  </div>
);

export default WhiteBox;
