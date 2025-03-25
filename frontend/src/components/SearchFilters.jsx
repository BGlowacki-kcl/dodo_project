import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllJobRoles, getAllJobLocations, getAllJobTypes, getAllCompanies } from "../services/job.service";

const FilterDropdown = ({ title, options, selectedOptions, setSelectedOptions, category }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleCheckboxChange = (value) => {
        setSelectedOptions(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
    };

    return (
        <div className="mb-2 bg-white rounded-xl">
            <button className="w-full text-left p-2" onClick={toggleDropdown}>
                {title}
            </button>
            {dropdownOpen && (
                

                <div className="bg-primary p-2 rounded">
                    <input
                        type="text"
                        placeholder={`Search ${title.toLowerCase()}...`}
                        className="w-full mb-2 rounded text-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-28 overflow-y-auto">
                        {options
                            .filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(option => (
                                <label key={option} className="block py-1 text-small">
                                    <input type="checkbox" className="mr-2" checked={selectedOptions.includes(option)} onChange={() => handleCheckboxChange(option)} />
                                    {option}
                                </label>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const SearchFilters = ({ applyFilters, hideCompanyFilter = false }) => {
    const url = useLocation();
    const searchParams = new URLSearchParams(url.search);
    
    const selectedJobTypes = searchParams.getAll("jobType");
    const selectedTitles = searchParams.getAll("role");
    const selectedLocations = searchParams.getAll("location");
    const selectedCompanies = searchParams.getAll("company");

    const [titles, setTitles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [companies, setCompanies] = useState([]);

    const [selectedJobTypesArray, setSelectedJobTypesArray] = useState([...selectedJobTypes]);
    const [selectedTitlesArray, setSelectedTitlesArray] = useState([...selectedTitles]);
    const [selectedLocationsArray, setSelectedLocationsArray] = useState([...selectedLocations]);
    const [selectedCompaniesArray, setSelectedCompaniesArray] = useState([...selectedCompanies]);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                setTitles(await getAllJobRoles()); 
                setLocations(await getAllJobLocations());
                setJobTypes(await getAllJobTypes());
                setCompanies(await getAllCompanies());

                setSelectedJobTypesArray([...selectedJobTypes]);
                setSelectedTitlesArray([...selectedTitles]);
                setSelectedLocationsArray([...selectedLocations]);
                setSelectedCompaniesArray([...selectedCompanies]);
            } catch (error) {
                console.error("Error fetching filter data:", error);
            }
        };

        fetchFilterData();
    }, []);

    return (
        <div className="left-32 h-full p-3 bg-secondary w-64 shadow-md flex flex-col">
            {/* Panel Label */}
            <h2 className="text-white font-bold text-lg mb-2 text-center">Filters</h2>

            {/* Scrollable Container */}
            <div className="overflow-y-auto max-h-[400px] space-y-2">
                <FilterDropdown title="Job Type" options={jobTypes} selectedOptions={selectedJobTypesArray} setSelectedOptions={setSelectedJobTypesArray} category="jobTypes" />
                <FilterDropdown title="Role" options={titles} selectedOptions={selectedTitlesArray} setSelectedOptions={setSelectedTitlesArray} category="titles" />
                <FilterDropdown title="Location" options={locations} selectedOptions={selectedLocationsArray} setSelectedOptions={setSelectedLocationsArray} category="locations" />
                {!hideCompanyFilter && (
                    <FilterDropdown title="Company" options={companies} selectedOptions={selectedCompaniesArray} setSelectedOptions={setSelectedCompaniesArray} category="companies" />
                )}
            </div>

            {/* Apply Filters Button */}
            <button className="mt-4 w-full button bg-primary text-dtext" onClick={() => applyFilters(selectedJobTypesArray, selectedTitlesArray, selectedLocationsArray, selectedCompaniesArray)}>
                Apply Filters
            </button>
        </div>
    );
};

export default SearchFilters;
