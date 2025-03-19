import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllJobRoles, getAllJobLocations, getAllJobTypes } from "../services/jobService";

const SwipeFilters = ({ applyFilters }) => {
    const url = useLocation();
    const searchParams = new URLSearchParams(url.search);
    
    const selectedJobTypes = searchParams.getAll("jobType");
    const selectedTitles = searchParams.getAll("role");
    const selectedLocations = searchParams.getAll("location");

    const [titles, setTitles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
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

    const handleCheckboxChange = (category, value) => {
        if (category === "jobTypes") {
            setSelectedJobTypesArray(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        } else if (category === "titles") {
            setSelectedTitlesArray(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        } else if (category === "locations") {
            setSelectedLocationsArray(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
        }
    };

    return (
        <div className="left-32 h-full p-3 bg-secondary w-64 shadow-md flex flex-col">
            {/* Panel Label */}
            <h2 className="text-white font-bold text-lg mb-2 text-center">Filters</h2>
            
            {/* Job Types */}
            <div className="mb-2">
                <label className="text-white text-small font-bold block mb-2">Job Type</label>
                <div className="max-h-28 overflow-y-auto bg-primary p-2 rounded">
                    {jobTypes.map((type) => (
                        <label key={type} className="block py-1 text-small">
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
            </div>

            {/* Job Titles */}
            <div className="mb-2">
                <label className="text-white text-small font-bold block mb-2">Role</label>
                <div className="max-h-28 overflow-y-auto bg-primary p-2 rounded">
                    {titles.map((title) => (
                        <label key={title} className="block py-1 text-small">
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
            </div>

            {/* Job Locations */}
            <div className="mb-2">
                <label className="text-white text-small font-bold block mb-2">Location</label>
                <div className="max-h-28 overflow-y-auto bg-primary p-2 rounded">
                    {locations.map((location) => (
                        <label key={location} className="block py-1 text-small">
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
            </div>
            
            {/* Apply Filters Button */}
            <button
                className="w-full button bg-primary text-dtext"
                onClick={() => applyFilters(selectedJobTypesArray, selectedTitlesArray, selectedLocationsArray)}
            >
                Apply Filters
            </button>
        </div>
    );
};

export default SwipeFilters;
