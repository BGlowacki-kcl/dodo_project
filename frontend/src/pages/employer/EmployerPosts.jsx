/**
 * EmployerPosts.jsx
 *
 * This component represents the Employer Posts Page in the application. It allows employers to:
 * - View a list of their job posts.
 * - Select a job to view metrics.
 * - Add, edit, delete, or view applicants for a job.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobsByEmployer, deleteJob } from "../../services/jobService";
import WhiteBox from "../../components/WhiteBox";
import Metrics from "../../components/Metrics";
import SearchFilters from "../../components/SearchFilters";
import Pagination from "../../components/Pagination";

const EmployerPostsPage = () => {
  // ----------------------------- State Variables -----------------------------
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Track current page
  const jobsPerPage = 3; // Number of jobs per page
  const navigate = useNavigate();

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches all jobs posted by the employer and updates the state.
   */
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

  // ----------------------------- Handlers -----------------------------
  /**
   * Navigates to the edit job page for the selected job.
   * @param {String} jobId - The ID of the job to edit.
   */
  const handleEdit = (jobId) => {
    navigate(`/posts/edit/${jobId}`);
  };

  /**
   * Navigates to the add new job page.
   */
  const handleAddJob = () => {
    navigate("/posts/new");
  };

  /**
   * Navigates to the applicants page for the selected job.
   * @param {String} jobId - The ID of the job to view applicants for.
   */
  const handleViewApplicants = (jobId) => {
    navigate(`/employer/applicants/${jobId}`);
  };

  /**
   * Deletes the selected job and updates the state.
   * @param {String} jobId - The ID of the job to delete.
   */
  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((job) => job._id !== jobId));
      setSelectedJob(null);
      alert("Job post deleted successfully!");
    } catch (error) {
      console.error("Failed to delete job post:", error);
      alert("Failed to delete job post");
    }
  };

  /**
   * Applies filters to the job posts.
   * @param {Array} selectedJobTypes - Selected job types.
   * @param {Array} selectedTitles - Selected job titles.
   * @param {Array} selectedLocations - Selected job locations.
   */
  const applyFilters = (selectedJobTypes, selectedTitles, selectedLocations) => {
    const filteredJobs = jobs.filter((job) => {
      const matchesJobType = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.employmentType);
      const matchesTitle = selectedTitles.length === 0 || selectedTitles.includes(job.title);
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(job.location);
      return matchesJobType && matchesTitle && matchesLocation;
    });
    setJobs(filteredJobs);
  };

  /**
   * Handles page change for pagination.
   * @param {Object} selected - The selected page object.
   */
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // ----------------------------- Render -----------------------------
  const offset = currentPage * jobsPerPage;
  const currentJobs = jobs.slice(offset, offset + jobsPerPage);
  const pageCount = Math.ceil(jobs.length / jobsPerPage);

  return (
    <div className="flex flex-row max-h-screen">
      <div className="w-30%">
        <SearchFilters applyFilters={applyFilters} hideCompanyFilter={true} />
      </div>
      <div className="bg-background min-h-screen w-full flex flex-col items-center">
        {/* PAGE HEADER */}
        <div className="text-center mt-2 mb-2">
          <h1 className="text-heading font-heading font-bold">Employer Posts</h1>
          <p className="text-medium mt-2">
            Manage and filter your job posts to find the right candidates.
          </p>
        </div>

        {/* JOB LIST */}
        <div className="flex flex-col space-y-4 px-4 pb-3 items-center w-full max-w-3xl">
          {currentJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-lg shadow-md p-4 w-full relative"
            >
              <div className="w-full">
                <p className="text-medium font-bold">{job.title}</p>
                <p className="text-medium font-semibold">Type: {job.employmentType}</p>
                <p className="text-medium font-semibold">Location: <span className="font-medium">{job.location}</span></p>
                <p className="text-small mb-1">{job.description}</p>
                <div className="flex space-x-2 mt-2">
                  <button className="button" onClick={() => handleEdit(job._id)}>Edit</button>
                  <button className="button" onClick={() => handleViewApplicants(job._id)}>View Applicants</button>
                  <button className="button" onClick={() => handleDelete(job._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && <p className="text-white text-center">No job posts found.</p>}
        </div>

        {/* PAGINATION */}
        <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default EmployerPostsPage;


