import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllJobs, getFilteredJobs } from "../services/jobService";
import { authService } from '../services/auth.service';

const SearchResults = () => {
    const url = useLocation();
    const searchParams = new URLSearchParams(url.search);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Extract query parameters as arrays
    const jobTypes = searchParams.getAll("jobType");
    const locations = searchParams.getAll("location");
    const roles = searchParams.getAll("role");

    // State for job search results
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid");

    const checkAuthStatus = () => {
        const token = sessionStorage.getItem('token'); // Assuming token is stored in sessionStorage
        setIsLoggedIn(!!token); // Convert token presence to boolean
    };

    // Listen for storage changes (in case user logs in/out in another tab)
    useEffect(() => {
        checkAuthStatus();
        window.addEventListener('storage', checkAuthStatus);
        window.addEventListener('authChange', checkAuthStatus);
        return () => {
          window.removeEventListener('storage', checkAuthStatus);
          window.removeEventListener('authChange', checkAuthStatus);
        };
    }, []);

    //uses url parameters to search for jobs
    const fetchSearchResults = async () => {
        try {
            let data;
            const filters = {};
            if (jobTypes.length > 0) filters.jobType = jobTypes;
            if (locations.length > 0) filters.location = locations;
            if (roles.length > 0) filters.role = roles;
            if (Object.keys(filters).length > 0) {
                console.log("Fetching filtered jobs with:", filters);
                data = await getFilteredJobs(filters);
            } else {
                console.log("Fetching all jobs");
                data = await getAllJobs();
            }
    
            setSearchResults(data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSearchResults();
    }, [jobTypes, locations, roles]);

    // Handle view mode switch
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    return (
        <div className="bg-background min-h-screen w-full flex flex-col items-center">
            {/* PAGE HEADER */}
            <div className="text-center mt-10 mb-4">
                <h1 className="text-heading font-heading font-bold">Search Results</h1>
                <p className="text-medium mt-2">
                    {jobTypes.length > 0 || locations.length > 0 || roles.length > 0
                        ? `Showing results for ${[...jobTypes, ...locations, ...roles].join(", ")}`
                        : "Find the perfect opportunity for you"}
                </p>
            </div>
            
            {/* TOGGLE BUTTONS FOR GRID OR LIST */}
            <div className="flex mb-4 gap-4">
                <button onClick={() => handleViewModeChange("grid")} className={`button ${viewMode === "grid" ? "bg-secondary text-ltext" : "bg-primary text-dtext"}`}>
                    Grid View
                </button>
                <button onClick={() => handleViewModeChange("list")} className={`button ${viewMode === "list" ? "bg-secondary text-ltext" : "bg-primary text-dtext"}`}>
                    List View
                </button>
            </div>

            {/* JOB CONTAINER */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-10" : "flex flex-col space-y-4 px-4 pb-10 items-center"}>
                {loading ? (
                    <p className="text-ltext text-center">Loading search results...</p>
                ) : searchResults.length > 0 ? (
                    searchResults.map((job) => (
                        <div key={job._id} className={`bg-white rounded-lg shadow-md flex flex-col justify-between relative ${viewMode === "grid" ? "w-full h-68" : "w-3/4 h-52"}`}>
                            
                            {/* add to shortlist*/}
                            {isLoggedIn && (
                                <button className="absolute top-2 right-2 bg-primary text-secondary rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-secondary hover:text-ltext transition">
                                    +
                                </button>
                            )}


                            <div className="flex w-full p-3">
                                <div className="">
                                    <p className="text-medium font-bold">{job.title}</p>
                                    <p className="text-medium font-semibold">Type: {job.employmentType}</p>
                                    <p className="text-medium font-semibold">Location: <span className="font-medium">{job.location}</span></p>
                                    <p className="text-medium font-semibold">Requirements: <span className="font-medium">{job.requirements.join(", ")}</span></p>
                                    <p className="text-small mb-1">{job.description}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-white text-center">No job results found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
