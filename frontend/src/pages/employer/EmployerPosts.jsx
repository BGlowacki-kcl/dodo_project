import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobsByEmployer } from "../../services/jobService";
import { getApplicationsData } from "../../services/applicationService";
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
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchData = async () => {
    try {
      const data = await getApplicationsData();
      setApplicants(data.groupedStatuses || []);
    } catch (error) {
      console.error("Error fetching applications data:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchData();
  }, []);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

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

  const offset = currentPage * jobsPerPage;
  const currentJobs = jobs.slice(offset, offset + jobsPerPage);
  const pageCount = Math.ceil(jobs.length / jobsPerPage);

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
                statusBreakdown={statusBreakdown} // Pass breakdown here
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


