import React from 'react';

const Metrics = ({ selectedJob }) => {
  if (!selectedJob) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Job Details</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Title</h3>
          <p>{selectedJob.title}</p>
        </div>
        <div>
          <h3 className="font-medium">Company</h3>
          <p>{selectedJob.company}</p>
        </div>
        <div>
          <h3 className="font-medium">Location</h3>
          <p>{selectedJob.location}</p>
        </div>
        <div>
          <h3 className="font-medium">Description</h3>
          <p>{selectedJob.description}</p>
        </div>
        <div>
          <h3 className="font-medium">Salary Range</h3>
          <p>
            {selectedJob.salaryRange ? 
              `$${selectedJob.salaryRange.min} - $${selectedJob.salaryRange.max}` 
              : 'Not specified'}
          </p>
        </div>
        <div>
          <h3 className="font-medium">Requirements</h3>
          <ul className="list-disc pl-5">
            {selectedJob.requirements?.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
    if (!selectedJob) {
        return <div>No job selected</div>;
      }
    const applicantCount = selectedJob.applicants ? selectedJob.applicants.length : 0;
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-100 p-6 shadow rounded">
                <h3 className="text-lg font-bold">Applicants</h3>
                <p className="text-2xl">{applicantCount}</p>
            </div>

            <div className="bg-yellow-100 p-6 shadow rounded">
                <h3 className="text-lg font-bold">Potential Applicants</h3>
                <p className="text-2xl">5 (placeholder)</p>
            </div>

            <div className="bg-blue-100 p-6 shadow rounded col-span-2">
                <h3 className="text-lg font-bold">Currently Viewing</h3>
                <p className="text-xl">{selectedJob}</p>
            </div>
        </div>
    );
};

export default Metrics;
