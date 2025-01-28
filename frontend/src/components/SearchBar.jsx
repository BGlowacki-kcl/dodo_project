import React from "react";

const SearchBar = ({ placeholder = "Search...", onSearch }) => {
    const handleInputChange = (event) => {
        if (onSearch) {
            onSearch(event.target.value);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder={placeholder}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default SearchBar;






