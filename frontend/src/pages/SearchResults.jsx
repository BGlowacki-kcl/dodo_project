import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllJobs, getFilteredJobs } from "../services/job.service.js";
import JobCard from "../components/JobCard";
import { addJobToShortlist, getShortlist } from "../services/shortlist.service";
import { useNotification } from "../context/notification.context";
import Pagination from "../components/Pagination";
import SearchAndShortlistFilter from "../components/filters/SearchAndShortlistFilter";

const SearchResults = () => {
    const url = useLocation();
    const searchParams = new URLSearchParams(url.search);
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [shortlistedJobIds, setShortlistedJobIds] = useState(new Set());
    const [isFilterOpen, setIsFilterOpen] = useState(false); // State to control filter pop-up
    const resultsPerPage = 10;
    const showNotification = useNotification();

    // Extract query parameters
    const jobTypes = searchParams.getAll("jobType");
    const locations = searchParams.getAll("location");
    const roles = searchParams.getAll("role");
    const companies = searchParams.getAll("company");

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
        if (isLoggedIn) {
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
            setLoading(true);
            let data;
            const filters = { jobType: jobTypes, location: locations, role: roles, company: companies };

            if (Object.values(filters).some((value) => value && value.length > 0)) {
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
        // const url = `/user/jobs/details/${jobId}`;
        // window.open(url, "_blank");
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

    const applyFilters = async (filters) => {
        try {
            setLoading(true);
            setSearchResults([]);

            console.log("Applying filters in SearchResults:", filters);

            let data;
            if (Object.values(filters).some((value) => value && value.length > 0)) {
                console.log("Fetching filtered jobs with filters:", filters);
                data = await getFilteredJobs(filters);
            } else {
                console.log("Fetching all jobs (no filters applied)");
                data = await getAllJobs();
            }

            console.log("Filtered jobs fetched:", data);
            setSearchResults(data);
        } catch (error) {
            console.error("Error applying filters in SearchResults:", error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination logic
    const pageCount = Math.ceil(searchResults.length / resultsPerPage);
    const displayedJobs = searchResults.slice(currentPage * resultsPerPage, (currentPage + 1) * resultsPerPage);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="bg-background min-h-screen w-full flex flex-col items-center">
            {/* PAGE HEADER */}
            <div className="text-center mt-2 mb-2">
                <h1 className="text-heading font-heading font-bold">Search Results</h1>
                <p className="text-medium mt-2">
                    {jobTypes.length > 0 || locations.length > 0 || roles.length > 0 || companies.length > 0
                        ? `Showing results for ${[...jobTypes, ...locations, ...roles, ...companies].join(", ")}`
                        : "Find the perfect opportunity for you"}
                </p>
            </div>

            {/* FILTER BUTTON */}
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                onClick={() => setIsFilterOpen(true)}
            >
                Open Filters
            </button>

            {/* FILTER POP-UP */}
            <SearchAndShortlistFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                applyFilters={applyFilters}
            />

            {/* JOB LISTINGS */}
            <div className="flex flex-col space-y-4 px-4 pb-3 items-center w-full max-w-3xl overflow-y-auto max-h-90">
                {loading ? (
                    <p className="text-ltext text-center">Loading search results...</p>
                ) : displayedJobs.length > 0 ? (
                    displayedJobs.map((job) => (
                        <JobCard
                            key={job._id}
                            job={job}
                            isLoggedIn={isLoggedIn}
                            handleJobClick={handleJobClick}
                            handleAddToShortlist={handleAddToShortlist}
                            shortlist={shortlistedJobIds}
                        />
                    ))
                ) : (
                    <p className="text-white text-center">No job results found.</p>
                )}
            </div>

            {/* PAGINATION CONTROLS */}
            <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
        </div>
    );
};

export default SearchResults;
