import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllJobs, getFilteredJobs } from "../services/jobService";
import SwipeFilters from "../components/SwipeFilters";
import { authService } from "../services/auth.service";

const SearchResults = () => {
    const url = useLocation();
    const searchParams = new URLSearchParams(url.search);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;

    // Extract query parameters as arrays
    const jobTypes = searchParams.getAll("jobType");
    const locations = searchParams.getAll("location");
    const roles = searchParams.getAll("role");

    const checkAuthStatus = () => {
        const token = sessionStorage.getItem("token");
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        checkAuthStatus();
        window.addEventListener("storage", checkAuthStatus);
        window.addEventListener("authChange", checkAuthStatus);
        return () => {
            window.removeEventListener("storage", checkAuthStatus);
            window.removeEventListener("authChange", checkAuthStatus);
        };
    }, []);

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

    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);

    const totalPages = Math.ceil(searchResults.length / resultsPerPage);

    return (
        <div className="flex flex-row max-h-screen">
            <div className="w-30%">
                <SwipeFilters />
            </div>
            <div className="bg-background min-h-screen w-full flex flex-col items-center">
                {/* PAGE HEADER */}
                <div className="text-center mt-2 mb-2">
                    <h1 className="text-heading font-heading font-bold">Search Results</h1>
                    <p className="text-medium mt-2">
                        {jobTypes.length > 0 || locations.length > 0 || roles.length > 0
                            ? `Showing results for ${[...jobTypes, ...locations, ...roles].join(", ")}`
                            : "Find the perfect opportunity for you"}
                    </p>
                </div>

                {/* JOB CONTAINER (Scrollable List Format) */}
                <div className="flex flex-col space-y-4 px-4 pb-3 items-center w-full max-w-3xl overflow-y-auto max-h-90">
                    {loading ? (
                        <p className="text-ltext text-center">Loading search results...</p>
                    ) : currentResults.length > 0 ? (
                        currentResults.map((job) => (
                            <div key={job._id} className="bg-white rounded-lg shadow-md p-4 w-full relative">
                                {/* Add to shortlist */}
                                {isLoggedIn && (
                                    <button 
                                        className="absolute top-2 right-2 bg-primary text-secondary rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-secondary hover:text-ltext transition"
                                        onClick={() => handleAddToShortlist(job._id)}
                                    >
                                        +
                                    </button>
                                )}
                                <div className="w-full">
                                    <p className="text-medium font-bold">{job.title}</p>
                                    <p className="text-medium font-semibold">Type: {job.employmentType}</p>
                                    <p className="text-medium font-semibold">Location: <span className="font-medium">{job.location}</span></p>
                                    <p className="text-medium font-semibold">Requirements: <span className="font-medium">{job.requirements.join(", ")}</span></p>
                                    <p className="text-small mb-1">{job.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white text-center">No job results found.</p>
                    )}
                </div>

                {/* PAGINATION CONTROLS */}
                <div className="">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="button h-2"
                    >
                    </button>
                    <span className="">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="button h-2"
                    >
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
