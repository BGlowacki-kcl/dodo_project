import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../../services/jobService";
import JobCard from "../../components/JobCard";
/* 
JobDetailsPage is used to display the details of a single job using a component called job card

*/
function JobDetailsPage() {
    const { jobId } = useParams();  // Get job ID from URL parameters
    const navigate = useNavigate();  // Hook to navigate back to the previous page
    const [job, setJob] = useState(null);  // State to store the job details


   // Fetch job details
    useEffect(() => {
        async function fetchJob() {
            try {
                const jobData = await getJobById(jobId);
                setJob(jobData);
            } catch (err) {
                console.error("Error fetching job details:", err);
            }
        }

    fetchJob();
  }, [jobId]);
  
    // Show loading message while fetching job data
  if (!job) { 
    return (
        <div className="bg-slate-900 min-h-screen flex items-center justify-center">
            <p className="text-white">Loading job details...</p>
        </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen w-full flex flex-col items-center px-4 py-8">
      <JobCard job={job} />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200"
      >
        &larr; Back
      </button>
    </div>
  );
}

export default JobDetailsPage;
