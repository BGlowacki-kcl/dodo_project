import React, { useState, useEffect, useRef } from "react";

const ComboBox = ({ label, options, onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  //filters the options of the dropdown menu based on what the user types
  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
  }, [inputValue, options]);

  //recognises if the input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setDropdownOpen(true);
  };

  //handles the selection of an option from the dropdown
  const handleOptionClick = (option) => {
    setInputValue(option);
    setDropdownOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  //if the user types something thats not an option from the dropdown it clears
  const handleBlur = () => {
    setTimeout(() => {
      if (!options.includes(inputValue)) {setInputValue("")}
      setDropdownOpen(false);
    });
  };

  return (
    <div className="mb-4 relative">
      {/*Dropdown*/}
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

        {/* Dropdown options */}
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

export default ComboBox;
