import React, { useState, useEffect } from "react";
import Metrics from "../../components/Metrics.jsx";
import EmployerSideBar from "../../components/EmployerSideBar.jsx";

const EmployerPostsPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("/api/job")
      .then((response) => response.json())
      .then((data) => {
        setJobs(data);
        if (data.length > 0) {
          setSelectedJob(data[0]);
        }
      })
      .catch((error) => console.error("Error fetching jobs:", error));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar with fixed width */}
      <div className="w-64 bg-white shadow-lg">
        <EmployerSideBar />
      </div>

      {/* Main Content - Takes up remaining space */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">
          Employer Job Posts
        </h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Job List Sidebar */}
          <div className="bg-white text-[#1B2A41] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Job Posts</h2>

            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-lg cursor-pointer shadow-md transition transform ${
                      selectedJob?.id === job.id
                        ? "border-2 border-[#8D86C9] scale-105 bg-white"
                        : "bg-[#CCC9DC] text-[#1B2A41]"
                    }`}
                  >
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No job posts available.</p>
            )}
          </div>

          {/* Main Section - Metrics */}
          <div className="col-span-2 space-y-6">
            <div className="bg-[#CCC9DC] p-6 rounded-lg shadow-lg">
              {selectedJob ? (
                <Metrics selectedJob={selectedJob} />
              ) : (
                <p className="text-gray-700">Select a job to view metrics.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerPostsPage;


