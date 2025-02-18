import React, { useState } from "react";

//TO DO: Add functionality to the filter and replace array with data from model :D
const filtersList = [
  { id: "graduate", label: "Graduate" },
  { id: "fullTime", label: "Full Time" },
  { id: "partTime", label: "Part Time" },
  { id: "placement", label: "Placement" },
  { id: "internship", label: "Internship" },
  { id: "apprenticeship", label: "Apprenticeship" },
];

const SwipeFilters = ({ onApplyFilters }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleCheckboxChange = (filterId) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters(selectedFilters);
  };

  return (
    <div className="left-32 h-full p-5 bg-[#0c1821]">
      <p className="text-xl font-bold mb-4 text-white">Filter Job Type</p>

      <div className="space-y-3">
        {filtersList.map((filter) => (
          <label key={filter.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFilters.includes(filter.id)}
              onChange={() => handleCheckboxChange(filter.id)}
              className="h-5 w-5 appearance-none bg-gray-300 rounded-lg checked:bg-[#324a5f] focus:outline-none"
            />
            <p className="text-white">{filter.label}</p>
          </label>
        ))}
      </div>

      <button
        onClick={handleApplyFilters}
        className="mt-6 w-full bg-[#324a5f] text-white py-2 rounded-lg hover:scale-105 hover:brightness-110 transition"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default SwipeFilters;
