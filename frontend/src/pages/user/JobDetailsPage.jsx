import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../../services/job.service";
import { getAllUserApplications, applyToJob } from "../../services/application.service";
import { getShortlist, addJobToShortlist, removeJobFromShortlist } from "../../services/shortlist.service";
import { userService } from "../../services/user.service"; // Import a method to get the user ID

/* 
JobDetailsPage is used to display the details of a single job using a component called job card
*/
function JobDetailsPage() {
  const { jobId } = useParams();  // Get job ID from URL parameters
  const navigate = useNavigate();  // Hook to navigate back to the previous page
  const [job, setJob] = useState(null);  // State to store the job details
  const [applied, setApplied] = useState(false);  // State to check if the user has applied
  const [shortlisted, setShortlisted] = useState(false); // State to check if the job is in the shortlist
  const [userId, setUserId] = useState(null); // State to store the user ID

  useEffect(() => {
    async function fetchJob() {
      try {
        const jobData = await getJobById(jobId);
        setJob(jobData);
      } catch (err) {
        console.error("Error fetching job details:", err);
      }
    }

    async function checkIfApplied() {
      try {
        const userApps = await getAllUserApplications();
        const alreadyAppliedJobIds = userApps.map((app) => app.job?._id);
        setApplied(alreadyAppliedJobIds.includes(jobId));
      } catch (err) {
        console.error("Error checking applications:", err);
      }
    }

    async function fetchUserId() {
      try {
          const userId = await userService.getUserId();
          console.log("User ID:", userId);
          setUserId(userId);
      } catch (err) {
          console.error("Error fetching user ID:", err);
      }
  }

    async function checkIfShortlisted() {
      try {
        const shortlist = await getShortlist(userId); // Replace userId with the actual user ID
        const shortlistedJobIds = shortlist.jobs.map((job) => job._id);
        setShortlisted(shortlistedJobIds.includes(jobId));
      } catch (err) {
        console.error("Error checking shortlist:", err);
      }
    }
    
    if (sessionStorage.getItem("token")) {
      fetchUserId();
      fetchJob();
      checkIfApplied();
      checkIfApplied();
      checkIfShortlisted();
    }
  }, [jobId, userId]);

  const handleShortlistToggle = async () => {
    try {
      if (shortlisted) {
        await removeJobFromShortlist(jobId); // Replace userId with the actual user ID
      } else {
        await addJobToShortlist(jobId); // Replace userId with the actual user ID
      }
      setShortlisted(!shortlisted);
    } catch (err) {
      console.error("Error updating shortlist:", err);
    }
  };

  async function handleApply() {
    try {
      if (!applied) {
        await applyToJob({ jobId, coverLetter: "", answers: [] }); // Create application in "applying" status
      }
      navigate(`/apply/${jobId}`); // Navigate to Apply page
    } catch (err) {
      console.error("Error applying to job:", err);
    }
  }

  if (!job) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <p className="text-white">Loading job details...</p>
      </div>
    );
  }

  // JobCard component
  function JobCard({ job }) {
    return (
      <div className="max-w-2xl w-full bg-white p-6 rounded-md shadow-md">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>

        {job.company && (
          <p className="text-gray-700 mb-2">
            <strong>Company:</strong> {job.company}
          </p>
        )}

        <p className="text-gray-700 mb-2">
          <strong>Location:</strong> {job.location}
        </p>

        {job.salaryRange && (
          <p className="text-gray-700 mb-2">
            <strong>Salary Range:</strong> {job.salaryRange.min && job.salaryRange.max ? 
              `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}` : 
              "Not specified"}
          </p>
        )}

        {job.experienceLevel && (
          <p className="text-gray-700 mb-2">
            <strong>Experience Level:</strong> {job.experienceLevel}
          </p>
        )}

        {job.jobType && (
          <p className="text-gray-700 mb-2">
            <strong>Job Type:</strong> {job.jobType}
          </p>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-3">
            <strong className="text-gray-700">Requirements:</strong>
            <ul className="list-disc ml-6 text-gray-700 mt-1">
              {job.requirements.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {job.description && (
          <div className="mb-4">
            <strong className="text-gray-700">Description:</strong>
            <p className="text-gray-700 mt-1">{job.description}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen w-full flex flex-col items-center px-4 py-8">
      <JobCard job={job} />

      {/* Back Button */}
      <button
        onClick={() => navigate("/search-results")}
        className="mt-6 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200"
      >
        &larr; Back
      </button>
      {applied ? (
        <p className="mt-4 text-green-500 font-bold">You have already applied for this job.</p>
      ) : (
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          Apply
        </button>
      )}
      <button
        onClick={handleShortlistToggle}
        className={`mt-4 px-4 py-2 ${shortlisted ? "bg-red-600" : "bg-green-600"} text-white rounded hover:${shortlisted ? "bg-red-700" : "bg-green-700"} transition duration-200`}
      >
        {shortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
      </button>
    </div>
  );
}

export default JobDetailsPage;
