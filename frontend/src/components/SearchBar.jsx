import React from "react";
import { FaSearch } from "react-icons/fa"; // Import a search icon from react-icons

const SearchBar = ({ placeholder = "Search...", onSearch, width = "70%", height = "30px" }) => { // Added height prop
    const handleInputChange = (event) => {
        if (onSearch) {
            onSearch(event.target.value);
        }
    };

    return (
        <div
            className="flex items-center border border-gray-300 rounded-full shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
            style={{
                width,
                height, // Use the height prop
                padding: "0 15px", // Padding for spacing
            }}
        >
            <FaSearch className="text-black text-lg mr-3" /> {/* Search icon updated to black */}
            <input
                type="text"
                placeholder={placeholder}
                onChange={handleInputChange}
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                style={{ height: "100%" }} // Input takes full height of the container
            />
        </div>
    );
};

export default SearchBar;






