import React, { useState, useEffect } from "react";
import { getAllJobRoles, getAllJobLocations, getAllJobTypes, getAllCompanies, getSalaryBounds } from "../../services/jobService";
import { FaFilter, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaClock, FaBriefcase, FaClipboardList } from "react-icons/fa";

const SearchAndShortlistFilter = ({ isOpen, onClose, applyFilters }) => {
    const [titles, setTitles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [companies, setCompanies] = useState([]);

    const [selectedTitles, setSelectedTitles] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedJobTypes, setSelectedJobTypes] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [salaryRange, setSalaryRange] = useState([0, 100000]); // Default range
    const [salaryBounds, setSalaryBounds] = useState({ min: 0, max: 100000 }); // Dynamic bounds
    const [requirements, setRequirements] = useState("");
    const [deadlineRange, setDeadlineRange] = useState(7); // Default: 7 days

    // Fetch filter data (titles, locations, job types, companies, salary bounds)
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                setTitles(await getAllJobRoles());
                setLocations(await getAllJobLocations());
                setJobTypes(await getAllJobTypes());
                setCompanies(await getAllCompanies());

                // Fetch salary bounds
                const { minSalary, maxSalary } = await getSalaryBounds();
                setSalaryBounds({ min: minSalary, max: maxSalary });
                setSalaryRange([minSalary, maxSalary]); // Set initial range to bounds
            } catch (error) {
                console.error("Error fetching filter data:", error);
            }
        };

        fetchFilterData();
    }, []);

    const handleApplyFilters = () => {
        applyFilters({
            titles: selectedTitles,
            locations: selectedLocations,
            jobTypes: selectedJobTypes,
            companies: selectedCompanies,
            salaryRange,
            requirements,
            deadlineRange,
        });
        onClose();
    };

    const toggleSelection = (value, selectedList, setSelectedList) => {
        if (selectedList.includes(value)) {
            setSelectedList(selectedList.filter((item) => item !== value));
        } else {
            setSelectedList([...selectedList, value]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[600px] max-w-[90%] shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FaFilter className="text-blue-500" /> Advanced Filters
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Filter Content */}
                <div className="space-y-4 text-sm text-gray-700">
                    {/* Grid Layout for Compact Design */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Titles */}
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <FaClipboardList className="text-blue-500" /> Titles
                            </h3>
                            <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                                {titles.map((title) => (
                                    <label key={title} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedTitles.includes(title)}
                                            onChange={() => toggleSelection(title, selectedTitles, setSelectedTitles)}
                                        />
                                        {title}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Companies */}
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <FaBuilding className="text-blue-500" /> Companies
                            </h3>
                            <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                                {companies.map((company) => (
                                    <label key={company} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedCompanies.includes(company)}
                                            onChange={() => toggleSelection(company, selectedCompanies, setSelectedCompanies)}
                                        />
                                        {company}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Locations */}
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <FaMapMarkerAlt className="text-blue-500" /> Locations
                            </h3>
                            <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                                {locations.map((location) => (
                                    <label key={location} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedLocations.includes(location)}
                                            onChange={() => toggleSelection(location, selectedLocations, setSelectedLocations)}
                                        />
                                        {location}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Job Types */}
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <FaBriefcase className="text-blue-500" /> Job Types
                            </h3>
                            <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                                {jobTypes.map((type) => (
                                    <label key={type} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedJobTypes.includes(type)}
                                            onChange={() => toggleSelection(type, selectedJobTypes, setSelectedJobTypes)}
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Salary Range */}
                    <div>
                        <h3 className="font-semibold flex items-center gap-2">
                            <FaDollarSign className="text-blue-500" /> Salary Range
                        </h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min={salaryBounds.min}
                                max={salaryBounds.max}
                                step="1000"
                                value={salaryRange[1]}
                                onChange={(e) => setSalaryRange([salaryRange[0], Number(e.target.value)])}
                                className="w-full"
                            />
                            <span className="text-xs">{`$${salaryRange[0]} - $${salaryRange[1]}`}</span>
                        </div>
                    </div>

                    {/* Deadlines */}
                    <div>
                        <h3 className="font-semibold flex items-center gap-2">
                            <FaClock className="text-blue-500" /> Deadlines
                        </h3>
                        <input
                            type="number"
                            value={deadlineRange}
                            onChange={(e) => setDeadlineRange(Number(e.target.value))}
                            placeholder="Days until deadline"
                            className="w-full border rounded p-2 text-xs"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        className="bg-gray-300 px-4 py-2 rounded text-xs hover:bg-gray-400 transition"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded text-xs hover:bg-blue-600 transition"
                        onClick={handleApplyFilters}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchAndShortlistFilter;