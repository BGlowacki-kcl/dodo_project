import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import { getAllJobs, deleteJob, getJobsByEmployer } from '../../services/job.service';

import Metrics from "../../components/Metrics.jsx";
import EmployerSideBar from "../../components/EmployerSideBar.jsx";


const EmployerPostsPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await getJobsByEmployer();
        setJobs(jobsData);
        if (jobsData.length > 0) {
          setSelectedJob(jobsData[0]);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
  
    fetchJobs();
  }, []);

  const handleEdit = (jobId) => {
    navigate(`/posts/edit/${jobId}`);
  };

  const handleAddJob = () => {
    navigate("/posts/new");
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/employer/applicants/${jobId}`);
  };

  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(job => job._id !== jobId));
      setSelectedJob(null);
      alert("Job post deleted successfully!");
    } catch (error) {
      console.error("Failed to delete job post:", error);
      alert("Failed to delete job post");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar with fixed width */}
      

      {/* Main Content - Takes up remaining space */}
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

          <button
            onClick={handleAddJob}
            className="absolute bottom-25 left-30 px-4 py-2 bg-[#1B2A41] text-white rounded-lg  transition duration-100"
          >
            Add Job Post
          </button>

          {/* Main Section - Metrics */}
          <div className="col-span-2 space-y-6">
            <div className="bg-[#1B2A41] p-6 rounded-lg shadow-lg relative">
              {selectedJob ? (
                <>
                  <button
                    onClick={() => handleEdit(selectedJob._id)}
                    className="absolute top-8 right-10 px-4 py-2 bg-[#1B2A41] text-white rounded-lg  transition duration-100"
                  >
                    Edit Job
                  </button>
                  <button
                    onClick={() => handleViewApplicants(selectedJob._id)}
                    className="absolute top-8 right-40 px-4 py-2 bg-[#1B2A41] text-white rounded-lg  transition duration-100"
                  >
                    View Applicants
                  </button>
                  <button
                    onClick={() => handleDelete(selectedJob._id)}
                    className="absolute top-8 left-60 px-4 py-2 bg-[#1B2A41] text-white rounded-lg  transition duration-100"
                  >
                    Delete Job
                  </button>
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


