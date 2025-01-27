import React from "react";

const SearchBar = ({ placeholder = "Search...", onSearch }) => {
    const handleInputChange = (event) => {
        const value = event.target.value;
        if (onSearch) {
            onSearch(value); // Trigger the search callback with the input value
        }
    };

    return (
        <div className="flex items-center bg-white border border-gray-900 rounded-full h-10 w-64 shadow-sm focus-within:ring-2 focus-within:ring-slate-500 mt-8"> {/* Increased mt-8 for more spacing */}
            <input
                type="text"
                placeholder={placeholder}
                onChange={handleInputChange}
                className="flex-grow h-full border-none focus:outline-none text-gray-700 placeholder-gray-400 text-sm px-3"
            />
            <div className="text-gray-400 pr-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.79 3.71l4.1 4.1a1 1 0 01-1.42 1.42l-4.1-4.1A6 6 0 012 8z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </div>
    );
};

export default SearchBar;






