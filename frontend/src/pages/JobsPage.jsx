import React from "react";
import ComboBox from "../components/ComboBox";
import Dropdown from "../components/Dropdown";
import SearchBar from "../components/SearchBar";
import Checkbox from "../components/CheckBox";

const JobPage = () => {
    const handleSearch = (searchTerm) => {
        console.log("Searching for:", searchTerm);
        // Add search logic here
    };

    return (
        <div className="flex h-screen">
            {/* Left Sidebar */}
            <aside className="w-1/4 bg-gray-100 p-4">
                <h2 className="text-lg font-bold mb-4">Filters</h2>
            </aside>

            {/* Main Section */}
            <main className="flex-1 bg-gray-50 p-4">
                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <SearchBar placeholder="Search jobs..." onSearch={handleSearch} />
                    </div>
                </div>

                {/* Job Listings */}
                <div className="overflow-y-scroll h-[calc(100vh-80px)]">
                    <div className="grid grid-cols-1 gap-4">
                        {Array(10).fill().map((_, index) => (
                            <div
                                key={index}
                                className="p-4 border border-gray-300 bg-white shadow rounded-md"
                            >
                                <h3 className="font-semibold text-lg">Job Title {index + 1}</h3>
                                <p className="text-gray-600">Company Name</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobPage;


