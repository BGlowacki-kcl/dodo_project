/**
 * LandingComponents.jsx
 *
 * This file contains reusable components for the landing page:
 * - Box: A clickable box with an image background, counter, and text.
 * - ComboBox: A searchable dropdown component with filtering functionality.
 */

import React, { useState, useEffect, useRef } from "react";

// ----------------------------- Box Component -----------------------------
/**
 * Box Component
 *
 * A clickable box with an image background, counter, and text.
 * @param {string} image - The URL of the background image.
 * @param {string} text - The text to display inside the box.
 * @param {function} onClick - The function to call when the box is clicked.
 * @param {number} counter - The counter value to display.
 */
export const Box = ({ image, text, onClick, counter }) => (
  <div
    onClick={onClick}
    className="relative bg-cover bg-center rounded-3xl overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
    style={{ backgroundImage: `url(${image})`, height: "200px" }}
  >
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
      <p className="text-3xl font-bold">{counter}</p>
      <p className="text-lg font-medium">{text}</p>
    </div>
  </div>
);

// ----------------------------- ComboBox Component -----------------------------
/**
 * ComboBox Component
 *
 * A searchable dropdown component with filtering functionality.
 * @param {string} label - The label for the input field.
 * @param {Array<string>} options - The list of options to display in the dropdown.
 * @param {function} onSelect - The function to call when an option is selected.
 */
export const ComboBox = ({ label, options, onSelect }) => {
  // ----------------------------- State Variables -----------------------------
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  // ----------------------------- Functions -----------------------------
  /**
   * Filters the options based on the input value.
   */
  const filterOptions = () => {
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
  };

  // ----------------------------- Effects -----------------------------
  /**
   * Effect to filter options whenever the input value or options change.
   */
  useEffect(() => {
    filterOptions();
  }, [inputValue, options]);

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles changes to the input field.
   * @param {Object} e - The input change event.
   */
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setDropdownOpen(true);
  };

  /**
   * Handles the selection of an option.
   * @param {string} option - The selected option.
   */
  const handleOptionClick = (option) => {
    setInputValue(option);
    setDropdownOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  /**
   * Handles the blur event for the input field.
   */
  const handleBlur = () => {
    setTimeout(() => {
      if (!options.includes(inputValue)) {
        setInputValue("");
      }
      setDropdownOpen(false);
    });
  };

  // ----------------------------- Render -----------------------------
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={`Select a ${label}...`}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onFocus={() => setDropdownOpen(true)}
        onBlur={handleBlur}
      />
      {dropdownOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg w-full max-h-60 overflow-y-auto border border-gray-300">
          {filteredOptions.map((option) => (
            <li
              key={option}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};