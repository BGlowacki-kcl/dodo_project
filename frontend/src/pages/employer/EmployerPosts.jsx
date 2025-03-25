import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobsByEmployer } from "../../services/jobService";
import { getDashboardData } from "../../services/applicationService";
import Pagination from "../../components/Pagination";
import PostCard from "../../components/PostCard";

const EmployerPostsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const jobsPerPage = 4;
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const jobsData = await getJobsByEmployer();
      console.log("Jobs Data Response:", jobsData); 
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchData = async () => {
    try {
      const data = await getDashboardData();
      console.log("Dashboard Data Response:", data); // Debugging

      setApplicants(data.totalStatus || []);
      console.log("Status data:", data.totalStatus); // Debugging

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchData();
  }, []);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * jobsPerPage;
  const currentJobs = jobs.slice(offset, offset + jobsPerPage);
  const pageCount = Math.ceil(jobs.length / jobsPerPage);

  const calculateApplicants = (jobId) => {
    // Filter applicants for the specific job
    console.log("Applicants:", applicants); // Debugging
    const jobApplicants = applicants.filter((status) => status.jobId === jobId);
  
    // Calculate total applicants excluding "Applying" status
    const totalApplicants = jobApplicants
      .filter((status) => status._id !== "Applying")
      .reduce((sum, status) => sum + status.count, 0);
  
    // Calculate pending applicants excluding "Accepted", "Rejected", and "Applying" statuses
    const pendingApplicants = jobApplicants
      .filter(
        (status) =>
          status._id !== "Accepted" &&
          status._id !== "Rejected" &&
          status._id !== "Applying"
      )
      .reduce((sum, status) => sum + status.count, 0);
  
    return { totalApplicants, pendingApplicants };
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-4 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-left text-black">My Posts</h1>
          </div>
        </div>

        {/* Job Posts */}
        <div className="flex flex-col space-y-4">
          {currentJobs.map((job) => {
            const { totalApplicants, pendingApplicants } = calculateApplicants(job._id);
            return (
              <PostCard
                key={job._id}
                jobId={job._id}
                title={job.title}
                type={job.employmentType}
                location={job.location}
                totalApplicants={totalApplicants}
                pendingApplicants={pendingApplicants}
              />
            );
          })}
          {jobs.length === 0 && <p className="text-black text-center">No job posts found.</p>}
        </div>

        {/* Pagination */}
        <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default EmployerPostsPage;


