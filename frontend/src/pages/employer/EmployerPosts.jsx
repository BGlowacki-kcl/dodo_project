/**
 * EmployerPosts.jsx
 *
 * This component represents the Employer Posts page in the application. It provides:
 * - A list of job posts created by the employer.
 * - Search functionality to filter job posts.
 * - Pagination for navigating through job posts.
 * - A button to create a new job post.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobsByEmployer } from "../../services/job.service";
import { getApplicationsData } from "../../services/application.service";
import Pagination from "../../components/Pagination";
import PostCard from "../../components/PostCard";
import SearchBar from "../../components/SearchBar";
import { FaPlus } from "react-icons/fa";

const EmployerPostsPage = () => {
  // ----------------------------- State Variables -----------------------------
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const jobsPerPage = 4;
  const navigate = useNavigate();

  // ----------------------------- Effects -----------------------------
  /**
   * Effect to fetch jobs and application data when the component mounts.
   */
  useEffect(() => {
    fetchJobs();
    fetchApplicationsData();
  }, []);

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches all jobs created by the employer.
   */
  const fetchJobs = async () => {
    try {
      const jobsData = await getJobsByEmployer();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  /**
   * Fetches application data grouped by job and status.
   */
  const fetchApplicationsData = async () => {
    try {
      const data = await getApplicationsData();
      setApplicants(data.groupedStatuses || []);
    } catch (error) {
      console.error("Error fetching applications data:", error);
    }
  };

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles page change for pagination.
   * @param {Object} selected - The selected page object.
   */
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  /**
   * Handles search query updates.
   * @param {string} query - The search query.
   */
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  /**
   * Calculates applicant statistics for a specific job.
   * @param {string} jobId - The ID of the job.
   * @returns {Object} - Applicant statistics including total, pending, and status breakdown.
   */
  const calculateApplicants = (jobId) => {
    const jobApplicants = applicants.find((group) => group.jobId === jobId);
    if (!jobApplicants) return { totalApplicants: 0, pendingApplicants: 0, statusBreakdown: [] };

    const totalApplicants = jobApplicants.statuses
      .filter((status) => status.status !== "Applying")
      .reduce((sum, status) => sum + status.count, 0);

    const pendingApplicants = jobApplicants.statuses
      .filter(
        (status) =>
          status.status !== "Accepted" &&
          status.status !== "Rejected" &&
          status.status !== "Applying"
      )
      .reduce((sum, status) => sum + status.count, 0);

    const statusBreakdown = jobApplicants.statuses.map((status) => ({
      status: status.status,
      count: status.count,
    }));

    return { totalApplicants, pendingApplicants, statusBreakdown };
  };

  // ----------------------------- Derived Data -----------------------------
  /**
   * Filters jobs based on the search query.
   */
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery) ||
    job.location.toLowerCase().includes(searchQuery) ||
    job.employmentType.toLowerCase().includes(searchQuery)
  );

  const offset = currentPage * jobsPerPage;
  const currentJobs = filteredJobs.slice(offset, offset + jobsPerPage);
  const pageCount = Math.ceil(filteredJobs.length / jobsPerPage);

  // ----------------------------- Render -----------------------------
  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-4 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl md:text-4xl font-bold text-left text-black">My Posts</h1>
            <button
              onClick={() => navigate("/posts/new")}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all"
              title="Add New Post"
            >
              <FaPlus />
            </button>
          </div>
          <SearchBar
            placeholder="Search Posts"
            onSearch={handleSearch}
            width="20%"
            height="40px"
          />
        </div>

        {/* Job Posts */}
        <div className="flex flex-col space-y-4">
          {currentJobs.map((job) => {
            const { totalApplicants, pendingApplicants, statusBreakdown } = calculateApplicants(job._id);
            return (
              <PostCard
                key={job._id}
                jobId={job._id}
                title={job.title}
                type={job.employmentType}
                location={job.location}
                totalApplicants={totalApplicants}
                pendingApplicants={pendingApplicants}
                statusBreakdown={statusBreakdown}
                deadline={job.deadline}
              />
            );
          })}
          {filteredJobs.length === 0 && <p className="text-black text-center">No job posts found.</p>}
        </div>

        {/* Pagination */}
        <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default EmployerPostsPage;