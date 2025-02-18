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
      <label className="block text-[#ffffff] font-semibold mb-2">{label}</label>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`w-64 h-full bg-[#ccc9dc] rounded-sm py-2 px-4 text-left truncate ${
            selectedOption ? "text-black" : "text-gray-500"
          }`}
          onBlur={() => setDropdownOpen(false)}
        >
          {selectedOption || "Select an option..."}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <ul className="absolute z-10 mt-1 bg-white border rounded-sm shadow-lg w-64">
            {options.map((option) => (
              <li
                key={option}
                className="px-4 py-2 cursor-pointer hover:bg-[#ccc9dc]"
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
