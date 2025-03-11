import React from "react";

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

      {/* Optionally show salaryRange, experienceLevel, etc. */}
    </div>
  );
}

export default JobCard;
