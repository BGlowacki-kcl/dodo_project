/**
 * SearchBar.jsx
 *
 * This component provides a reusable search bar with a search icon.
 * - Supports customizable placeholder text, width, and height.
 * - Triggers the `onSearch` callback when the input value changes.
 */

import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ placeholder = "Search...", onSearch, width = "70%", height = "30px" }) => {
  // ----------------------------- Handlers -----------------------------
  /**
   * Handles input changes and triggers the `onSearch` callback.
   * @param {Object} event - The input change event.
   */
  const handleInputChange = (event) => {
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  // ----------------------------- Render -----------------------------
  return (
    <div
      className="flex items-center border border-gray-300 rounded-full shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
      style={{
        width,
        height, // Use the height prop
        padding: "0 15px", // Padding for spacing
      }}
    >
      <FaSearch className="text-black text-lg mr-3" /> {/* Search icon */}
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