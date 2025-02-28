import React from 'react';

const JobList = ({ jobs, onSelectJob }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Posted Jobs</h2>
      <div className="space-y-4">
        {jobs && jobs.map((job) => (
          <div
            key={job._id}
            onClick={() => onSelectJob(job)}
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="font-medium">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
            <p className="text-sm text-gray-500">{job.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;
