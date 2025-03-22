import React, { useState, useEffect, useRef } from "react";

// Box Component
export const Box = ({ image, text, onClick, counter }) => {
  return (
    <button
      onClick={onClick}
      className="relative w-48 h-48 bg-cover bg-center rounded-lg shadow-lg text-white font-semibold overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:brightness-110"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center flex-col">
        <p className="text-center">{counter}</p>
        <p className="text-center">{text}</p>
      </div>
    </button>
  );
};

// ComboBox Component
export const ComboBox = ({ label, options, onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
  }, [inputValue, options]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setDropdownOpen(true);
  };

  const handleOptionClick = (option) => {
    setInputValue(option);
    setDropdownOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!options.includes(inputValue)) {
        setInputValue("");
      }
      setDropdownOpen(false);
    });
  };

  return (
    <div className="mb-4 relative">
      <label className="text-dtext">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={`Select a ${label}...`}
          className="w-48 rounded-lg bg-secondary py-2 px-4 focus:outline-none placeholder-ltext text-ltext"
          onFocus={() => setDropdownOpen(true)}
          onBlur={handleBlur}
        />

        {dropdownOpen && filteredOptions.length > 0 && (
          <ul className="absolute z-10 mt-1 bg-primary rounded-sm shadow-lg w-48 max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
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

// Dropdown Component
export const Dropdown = ({ label, options, onSelect }) => {
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