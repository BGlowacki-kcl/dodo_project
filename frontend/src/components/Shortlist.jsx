import React, { useState, useEffect } from "react";
import { getShortlist, removeJobFromShortlist } from "../services/shortlist.service";
import JobCard from "./JobCard";
import { useNotification } from "../context/notification.context";

const ApplicantShortlist = () => {
    const [shortlistedJobs, setShortlistedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const showNotification = useNotification();

    useEffect(() => {
        async function fetchShortlist() {
            try {
                const data = await getShortlist();
                setShortlistedJobs(data.jobs);
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
            showNotification("Job removed from shortlist", "success");
        } catch (err) {
            console.error("Error removing job from shortlist:", err);
            showNotification("Failed to remove job from shortlist", "error");
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="flex flex-row items-center justify-between mb-8">
                <h1 className="text-4xl font-bold text-left text-black">My Shortlisted Jobs</h1>
            </div>

            {/* Job Listings */}
            <div className="flex flex-col space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500">Loading shortlisted jobs...</p>
                ) : shortlistedJobs.length === 0 ? (
                    <p className="text-center text-gray-500">No shortlisted jobs available.</p>
                ) : (
                    shortlistedJobs.map((job) => (
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
        </div>
    );
};

export default ApplicantShortlist;