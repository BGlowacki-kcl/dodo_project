import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Metrics from "../../components/Metrics.jsx";
import EmployerSideBar from "../../components/EmployerSideBar.jsx";

const EmployerPostsPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

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

  const handleEdit = (jobId) => {
    navigate(`/posts/edit/${jobId}`);
  };

  const handleAddJob = () => {
    navigate("/posts/new");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <EmployerSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">
          Employer Job Posts
        </h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Job List Sidebar */}
          <div className="bg-white text-[#1B2A41] p-4 rounded-lg shadow-lg h-96 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Job Posts</h2>

            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-lg cursor-pointer shadow-md transition transform ${
                      selectedJob?._id === job._id
                        ? "border-2 border-[#1B2A41] scale-105 bg-white"
                        : "bg-[#1B2A41] text-white"
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

          {/* Add Job Button */}
          <button
            onClick={handleAddJob}
            className="absolute bottom-25 left-30 px-4 py-2 bg-[#1B2A41] text-white rounded-lg transition duration-100"
          >
            Add Job Post
          </button>

          {/* Main Section - Metrics & Applicants */}
          <div className="col-span-2 space-y-6">
            <div className="bg-[#1B2A41] p-6 rounded-lg shadow-lg relative">
              {selectedJob ? (
                <>
                  {/* Edit Job Button */}
                  <button
                    onClick={() => handleEdit(selectedJob._id)}
                    className="absolute top-8 right-10 px-4 py-2 bg-[#1B2A41] text-white rounded-lg transition duration-100"
                  >
                    Edit Job
                  </button>

                  {/* ✅ New Button: View Applicants */}
                  <button
                    onClick={() => navigate(`/applicants?jobId=${selectedJob._id}`)}
                    className="absolute top-8 right-40 px-4 py-2 bg-green-600 text-white rounded-lg transition duration-100 hover:bg-green-700"
                  >
                    View Applicants
                  </button>

                  {/* Job Metrics */}
                  <Metrics selectedJob={selectedJob} />
                </>
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
