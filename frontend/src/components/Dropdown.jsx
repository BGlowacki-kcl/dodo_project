import React, { useState } from "react";

const Dropdown = ({ label, options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setDropdownOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div>
      <label className="text-dtext font-semibold mb-2">{label}</label>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-48 bg-secondary rounded-lg py-2 px-4 text-left text-ltext"
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
        >
          {selectedOption || `Select ${label}...`}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <ul className="absolute z-10 mt-1 bg-white rounded-sm shadow-lg w-48 max-h-60 overflow-y-auto border border-gray-300">
            {options.map((option) => (
              <li
                key={option}
                className="px-4 py-2 cursor-pointer hover:bg-secondary hover:text-ltext"
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
