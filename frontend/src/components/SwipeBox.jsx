import React from "react";

const SwipeBox = ({ companyLogo, companyName, role, jobDescription, jobType, location, salary, duration }) => {
  return (
    <div className="relative w-[300px] h-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">

      <div className="relative">
        <img src={companyLogo} alt={companyName} className="w-full h-32 object-cover" />
        <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 text-xs font-semibold rounded-full">
          {jobType}
        </div>
      </div>

      {/* Job Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">{role}</h3>
        <p className="text-sm text-gray-800">{companyName}</p>
        <p className="text-xs text-gray-700 mt-2">{location} • {duration}</p>
        <p className="text-xs text-gray-600 mt-2 line-clamp-3">{jobDescription}</p>
        <p className="text-sm text-gray-500 mt-2">{salary}</p>
      </div>

      <div className="flex justify-between px-4 py-3 bg-gray-100 border-t">
        <button className="px-4 py-2 text-red-500 rounded-lg transition w-35 hover:scale-105">
          ❌ Skip
        </button>
        <button className="px-4 py-2 text-green-500 rounded-lg transition w-35 hover:scale-105">
          ✅ Shortlist
        </button>
      </div>
    </div>
  );
};

export default SwipeBox;
