import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllJobs, getFilteredJobs } from "../services/jobService";
import SearchFilters from "../components/SearchFilters";
import { addJobToShortlist, getShortlist } from "../services/shortlist.service";
import { useNotification } from "../context/notification.context";

const SearchResults = () => {
    const url = useLocation();
    const searchParams = new URLSearchParams(url.search);
    const navigate = useNavigate();
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [shortlistedJobIds, setShortlistedJobIds] = useState(new Set());
    const resultsPerPage = 10;
    const showNotification = useNotification();

    // Extract query parameters as arrays
    const jobTypes = searchParams.getAll("jobType");
    const locations = searchParams.getAll("location");
    const roles = searchParams.getAll("role");

    const checkAuthStatus = () => {
        const token = sessionStorage.getItem("token");
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        const fetchShortlist = async () => {
            try {
                const { jobs } = await getShortlist();
                setShortlistedJobIds(new Set(jobs.map((job) => job._id)));
            } catch (err) {
                console.error("Error fetching shortlist:", err);
            }
        };
        if(isLoggedIn) {
            fetchShortlist();
        }
    }, [isLoggedIn]);

    const checkIfShortlisted = (jobId) => shortlistedJobIds.has(jobId);

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
            filters.jobType = jobTypes;
            filters.location = locations;
            filters.role = roles;
            if (Object.keys(filters)) {
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

    const handleJobClick = (jobId) => {
        navigate(`/user/jobs/details/${jobId}`);
    };

    const handleAddToShortlist = async (jobId) => {
        try {
            addJobToShortlist(jobId);
            setShortlistedJobIds((prev) => new Set(prev).add(jobId));
            showNotification("Job added to shortlist", "success");
        } catch (err) {
            console.error("Error updating shortlist:", err);
            showNotification("Error while adding post to the shortlist", "error");
        }
    };

    useEffect(() => {
        fetchSearchResults();
    }, []);

    const applyFilters = async (selectedJobTypes, selectedTitles, selectedLocations) => {
        try {
            setLoading(true);  // Start loading
            setSearchResults([]); // Clear previous results before applying new filters
    
            let data;
            const filters = {};
    
            if (selectedJobTypes) filters.jobType = selectedJobTypes;
            if (selectedTitles) filters.role = selectedTitles;
            if (selectedLocations) filters.location = selectedLocations;
    
            console.log("Applying filters:", filters);
    
            if (Object.values(filters).some(value => value && value.length > 0)) {
                data = await getFilteredJobs(filters);
            } else {
                data = await getAllJobs();
            }
    
            setSearchResults(data);
        } catch (error) {
            console.error("Error applying filters:", error);
        } finally {
            setLoading(false); // Stop loading after data is fetched
        }
    };

    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);

    const totalPages = Math.ceil(searchResults.length / resultsPerPage);

    return (
        <div className="flex flex-row max-h-screen">
            <div className="w-30%">
                <SearchFilters applyFilters={applyFilters} />
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
                            <div
                                key={job._id}
                                className={`bg-white rounded-lg shadow-md p-4 w-full relative ${isLoggedIn ? 'cursor-pointer' : ''}`}
                                {...(isLoggedIn ? { onClick: () => handleJobClick(job._id) } : {})}
                            >
                                {/* Add to shortlist */}
                                {isLoggedIn && (
                                    !checkIfShortlisted(job._id) ? (
                                        <button 
                                            className="absolute top-2 right-2 bg-primary text-secondary rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-secondary hover:text-ltext transition"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToShortlist(job._id);
                                            }}
                                            title="Add to shortlist"
                                        >
                                            +
                                        </button>
                                    ) : (
                                        <button 
                                            className="absolute top-2 right-2 text-primary rounded-full w-6 h-6 flex items-center justify-center shadow-md bg-secondary"
                                            disabled
                                            title="Already added to shortlist"
                                        >
                                            ✓
                                        </button>
                                    )
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
