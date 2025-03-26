import React, { useState, useEffect } from "react";
import { getShortlist, removeJobFromShortlist } from "../services/shortlist.service";
import JobCard from "./JobCard";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import { useNotification } from "../context/notification.context";

const ApplicantShortlist = () => {
    const [shortlistedJobs, setShortlistedJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]); // Jobs filtered by the search query
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0); // Track the current page
    const jobsPerPage = 15; // Number of jobs to display per page
    const showNotification = useNotification();

    useEffect(() => {
        async function fetchShortlist() {
            try {
                const data = await getShortlist();
                setShortlistedJobs(data.jobs);
                setFilteredJobs(data.jobs); // Initialize filtered jobs with all jobs
            } catch (err) {
                console.error("Failed to fetch shortlist:", err);
                showNotification("Failed to fetch shortlisted jobs", "error");
            } finally {
                setLoading(false);
            }
        }
        fetchShortlist();
    }, []);

    const handleRemoveFromShortlist = async (jobId) => {
        try {
            await removeJobFromShortlist(jobId);
            setShortlistedJobs((prev) => prev.filter((job) => job._id !== jobId));
            setFilteredJobs((prev) => prev.filter((job) => job._id !== jobId)); // Update filtered jobs
            showNotification("Job removed from shortlist", "success");
        } catch (err) {
            console.error("Error removing job from shortlist:", err);
            showNotification("Failed to remove job from shortlist", "error");
        }
    };

    const handleSearch = (query) => {
        const lowerCaseQuery = query.toLowerCase();
        const filtered = shortlistedJobs.filter((job) =>
            job.title.toLowerCase().includes(lowerCaseQuery) ||
            job.company.toLowerCase().includes(lowerCaseQuery) ||
            job.location.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredJobs(filtered);
        setCurrentPage(0); // Reset to the first page when searching
    };

    // Calculate the jobs to display on the current page
    const startIndex = currentPage * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const currentJobs = filteredJobs.slice(startIndex, endIndex);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected); // Update the current page
    };

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
                <h1 className="text-4xl font-bold text-left text-black">My Shortlist</h1>
                <SearchBar
                    placeholder="Search jobs..."
                    onSearch={handleSearch}
                    width="20%" // Match the width of the SearchResults page
                    height="40px" // Match the height of the SearchResults page
                />
            </div>

            {/* Job Listings */}
            <div className="flex flex-col space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500">Loading shortlisted jobs...</p>
                ) : filteredJobs.length === 0 ? (
                    <p className="text-center text-gray-500">No shortlisted jobs match your search.</p>
                ) : (
                    currentJobs.map((job) => (
                        <JobCard
                            key={job._id}
                            job={job}
                            isLoggedIn={true}
                            isShortlisted={true}
                            handleJobClick={() => console.log(`Navigating to job ${job._id}`)} // Replace with actual navigation logic
                            handleRemoveFromShortlist={handleRemoveFromShortlist}
                            handleAddToShortlist={() => {}} // Not needed here
                            showNotification={showNotification}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredJobs.length > jobsPerPage && (
                <Pagination
                    pageCount={Math.ceil(filteredJobs.length / jobsPerPage)}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default ApplicantShortlist;