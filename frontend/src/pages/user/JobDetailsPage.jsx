import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../../services/jobService";

/* 
JobDetailsPage is used to display the details of a single job using a component called job card
*/
function JobDetailsPage() {
  const { jobId } = useParams();  // Get job ID from URL parameters
  const navigate = useNavigate();  // Hook to navigate back to the previous page
  const [job, setJob] = useState(null);  // State to store the job details

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
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200"
      >
        &larr; Back
      </button>
      <button
        onClick={() => navigate(`/apply/${jobId}`)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
      >
        Apply
      </button>
    </div>
  );
}

export default JobDetailsPage;
