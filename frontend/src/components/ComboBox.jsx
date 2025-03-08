import React, { useState } from "react";

const ComboBox = ({ label, options, onSelect }) => {
  const [inputValue, setInputValue] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleOptionClick = (option) => {
    setInputValue([option]);
    setDropdownOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className="mb-4">
      <label className="text-dtext font-semibold mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={inputValue.join('')}
          onChange={(e) => setInputValue([e.target.value])}
          placeholder={`Select a ${label}...`}
          className="w-48 rounded-lg bg-secondary py-2 px-4 focus:outline-none placeholder-ltext text-ltext"
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
        />

        {/* Dropdown options */}
        {dropdownOpen && (
          <ul className="absolute z-10 mt-1 bg-primary rounded-sm shadow-lg w-full">
            {options
              .filter((option) =>
                option.toLowerCase().includes(inputValue.join('').toLowerCase())
              )
              .map((option) => (
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

export default ComboBox;