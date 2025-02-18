import React, { useState } from "react";

const ComboBox = ({ label, options }) => {
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleOptionClick = (option) => {
    setInputValue(option);
    setDropdownOpen(false);
  };

  return (
    <div className="mb-4">
      <label className="block text-white font-semibold mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={label}
          className={`w-full rounded-sm bg-[#ccc9dc] py-2 px-4 focus:outline-none ${
            inputValue ? "text-black" : "text-gray-500"
          }`}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        />

        {/* Filters options based on what the user has typed */}
        {dropdownOpen && (
          <ul className="absolute z-10 mt-1 bg-white rounded-sm shadow-lg w-full">
            {options
              .filter((option) =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              )
              .map((option) => (
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

export default ComboBox;
