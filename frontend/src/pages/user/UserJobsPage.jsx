import React, { useEffect, useState } from "react";
import { getAllJobs, applyToJob } from "../../services/applicationService";

function UserJobsPage() {
    const [jobs, setJobs] = useState([]);
    const userId = "user1"; 

    useEffect(() => {
        async function fetchJobs() {
            const data = await getAllJobs();
            setJobs(data);
        }
        fetchJobs();
    }, []);

    const handleApply = async (jobId) => {
        const coverLetter = "HELLO I AM THE COVER LETTER COVER LETTER COVER LETTER";
        try {
            const newApp = await applyToJob({ jobId, userId, coverLetter });
            console.log("Application successful!", newApp);
            alert("Applied successfully!");
        } 
        catch (err) {
            console.error(err);
            alert("Failed to apply.");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Available Job Posts</h1>
            <div className="space-y-4">
                {jobs.map((job) => (
                <div key={job._id} className="border p-4 rounded-md">
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                    <p>{job.description}</p>
                    <p>Location: {job.location}</p>
                    <p>Requirements: {job.requirements?.join(", ")}</p>
                    <button
                    onClick={() => handleApply(job._id)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                    Apply
                    </button>
                </div>
                ))}
            </div>
        </div>
    );
    }

export default UserJobsPage;
