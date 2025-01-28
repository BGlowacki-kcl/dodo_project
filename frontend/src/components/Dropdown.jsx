import React, { useState } from "react";

const Dropdown = ({ label, options }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };

  return (
    <div className="mb-4">
    <label className="block text-slate-100 font-semibold mb-2">{label}</label>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-64 h-full border bg-white border-gray-300 rounded-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-slate-500 text-left truncate"
          onBlur={() =>setDropdownOpen(false)}
        >
          {selectedOption || label} 
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <ul className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg w-64">
            {options.map((option) => (
              <li
                key={option}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
