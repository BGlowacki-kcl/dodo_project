import React, { useState, useEffect, useRef } from "react";

// Box Component
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