import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllJobs, getFilteredJobs } from "../services/job.service.js";
import JobCard from "../components/JobCard";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { addJobToShortlist, getShortlist, removeJobFromShortlist } from "../services/shortlist.service";
import { useNotification } from "../context/notification.context";

const SearchResults = () => {
    const url = useLocation();
    const searchParams = new URLSearchParams(url.search);
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [shortlistedJobIds, setShortlistedJobIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState("");
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
                data = await getFilteredJobs(filters);
            } else {
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

    const handleRemoveFromShortlist = async (jobId) => {
        try{ 
            removeJobFromShortlist(jobId);
            setShortlistedJobIds((prev) => {
                const updated = new Set(prev);
                updated.delete(jobId);
                return updated;
            });
            showNotification("Job removed from shortlist", "success");

        } catch(err) {
            console.error("Error updating shortlist:", err);
            showNotification("Error while removing post from the shortlist", "error");

        }
    };

    useEffect(() => {
        fetchSearchResults();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query.toLowerCase());
    };

    // Filter jobs based on the search query
    const filteredJobs = searchResults.filter((job) =>
        job.title.toLowerCase().includes(searchQuery) ||
        job.location.toLowerCase().includes(searchQuery) ||
        job.company.toLowerCase().includes(searchQuery)
    );

    // Pagination logic
    const offset = currentPage * resultsPerPage;
    const displayedJobs = filteredJobs.slice(offset, offset + resultsPerPage);
    const pageCount = Math.ceil(filteredJobs.length / resultsPerPage);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex-1 p-4 md:p-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                    <h1 className="text-3xl md:text-4xl font-bold text-left text-black">Search Results</h1>
                    <SearchBar
                        placeholder="Search Results"
                        onSearch={handleSearch}
                        width="20%"
                        height="40px"
                    />
                </div>

                {/* Job Listings */}
                <div className="flex flex-col space-y-4">
                    {loading ? (
                        <p className="text-black text-center">Loading search results...</p>
                    ) : displayedJobs.length > 0 ? (
                        displayedJobs.map((job) => (
                            <JobCard
                                key={job._id}
                                job={job}
                                isLoggedIn={isLoggedIn}
                                handleJobClick={handleJobClick}
                                handleAddToShortlist={handleAddToShortlist}
                                handleRemoveFromShortlist={handleRemoveFromShortlist}
                                isShortlisted={checkIfShortlisted(job._id)}
                            />
                        ))
                    ) : (
                        <p className="text-black text-center">No job results found.</p>
                    )}
                </div>

                {/* Pagination */}
                <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default SearchResults;