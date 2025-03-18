import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllJobRoles, getAllJobLocations, getAllJobTypes } from "../services/jobService";

const SwipeFilters = () => {
    const url = useLocation();
    const searchParams = new URLSearchParams(url.search);
    
    const selectedJobTypes = searchParams.getAll("jobType");
    const selectedTitles = searchParams.getAll("role");
    const selectedLocations = searchParams.getAll("location");

    const [titles, setTitles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [dropdowns, setDropdowns] = useState({
        titles: false,
        locations: false,
        jobTypes: false
    });
    const [selectedJobTypesArray, setSelectedJobTypesArray] = useState([...selectedJobTypes]);
    const [selectedTitlesArray, setSelectedTitlesArray] = useState([...selectedTitles]);
    const [selectedLocationsArray, setSelectedLocationsArray] = useState([...selectedLocations]);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                setTitles(await getAllJobRoles()); 
                setLocations(await getAllJobLocations());
                setJobTypes(await getAllJobTypes());
                
                setSelectedJobTypesArray([...selectedJobTypes]);
                setSelectedTitlesArray([...selectedTitles]);
                setSelectedLocationsArray([...selectedLocations]);
            } catch (error) {
                console.error("Error fetching filter data:", error);
            }
        };

        fetchFilterData();
    }, []);

    const toggleDropdown = (key) => {
        setDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCheckboxChange = (category, value) => {
        if (category === "jobTypes") {
            setSelectedJobTypesArray(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        } else if (category === "titles") {
            setSelectedTitlesArray(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        } else if (category === "locations") {
            setSelectedLocationsArray(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        }
    };

    const applyFilters = () => {
        console.log("Selected Job Types:", selectedJobTypesArray);
        console.log("Selected Titles:", selectedTitlesArray);
        console.log("Selected Locations:", selectedLocationsArray);
        
    };

    return (
        <div className="left-32 h-full p-5 bg-secondary w-64 shadow-md flex flex-col">
            {/* Panel Label */}
            <h2 className="text-white font-bold text-lg mb-4 text-center">Filters</h2>
            <div className="overflow-y-auto max-h-screen flex-grow">
                {/* Job Types Dropdown */}
                <div className="mb-4">
                    <button
                        className="w-full text-left font-bold bg-primary p-2 rounded"
                        onClick={() => toggleDropdown("jobTypes")}
                    >
                        Job Type
                    </button>
                    {dropdowns.jobTypes && (
                        <div className="max-h-60 overflow-y-auto bg-primary p-2 mt-2 rounded">
                            {jobTypes.map((type) => (
                                <label key={type} className="block py-1">
                                    <input 
                                        type="checkbox" 
                                        className="mr-2" 
                                        checked={selectedJobTypesArray.includes(type)} 
                                        onChange={() => handleCheckboxChange("jobTypes", type)}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Job Titles Dropdown */}
                <div className="mb-4">
                    <button
                        className="w-full text-left font-bold bg-primary p-2 rounded"
                        onClick={() => toggleDropdown("titles")}
                    >
                        Role
                    </button>
                    {dropdowns.titles && (
                        <div className="max-h-60 overflow-y-auto bg-primary p-2 mt-2 rounded">
                            {titles.map((title) => (
                                <label key={title} className="block py-1">
                                    <input 
                                        type="checkbox" 
                                        className="mr-2" 
                                        checked={selectedTitlesArray.includes(title)} 
                                        onChange={() => handleCheckboxChange("titles", title)}
                                    />
                                    {title}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Job Locations Dropdown */}
                <div className="mb-4">
                    <button
                        className="w-full text-left font-bold bg-primary p-2 rounded"
                        onClick={() => toggleDropdown("locations")}
                    >
                        Location
                    </button>
                    {dropdowns.locations && (
                        <div className="max-h-60 overflow-y-auto bg-primary p-2 mt-2 rounded">
                            {locations.map((location) => (
                                <label key={location} className="block py-1">
                                    <input 
                                        type="checkbox" 
                                        className="mr-2" 
                                        checked={selectedLocationsArray.includes(location)} 
                                        onChange={() => handleCheckboxChange("locations", location)}
                                    />
                                    {location}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Apply Filters Button */}
            <button
                className="w-full mt-4 bg-primary text-white font-bold p-2 rounded"
                onClick={applyFilters}
            >
                Apply Filters
            </button>
        </div>
    );
};

export default SwipeFilters;
