import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobsByEmployer } from "../../services/jobService";
import { getDashboardData } from "../../services/applicationService";
import WhiteBox from "../../components/WhiteBox";
import SearchFilters from "../../components/SearchFilters";
import Pagination from "../../components/Pagination";
import PostCard from "../../components/PostCard";

const EmployerPostsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const jobsPerPage = 3;
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

  const applyFilters = (selectedJobTypes, selectedTitles, selectedLocations) => {
    const filteredJobs = jobs.filter((job) => {
      const matchesJobType = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.employmentType);
      const matchesTitle = selectedTitles.length === 0 || selectedTitles.includes(job.title);
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(job.location);
      return matchesJobType && matchesTitle && matchesLocation;
    });
    setJobs(filteredJobs);
  };

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
    <div className="flex flex-row max-h-screen">
      <div className="w-30%">
        <SearchFilters applyFilters={applyFilters} hideCompanyFilter={true} />
      </div>
      <div className="bg-background min-h-screen w-full flex flex-col items-center">
        <div className="text-center mt-2 mb-2">
          <h1 className="text-heading font-heading font-bold">Employer Posts</h1>
          <p className="text-medium mt-2">
            Manage and filter your job posts to find the right candidates.
          </p>
        </div>
        <div className="flex flex-col space-y-4 px-4 pb-3 items-center w-full max-w-3xl">
          {currentJobs.map((job) => {
            const { totalApplicants, pendingApplicants } = calculateApplicants(job._id);
            return (
              <PostCard
                key={job._id}
                jobId={job._id} // Pass jobId to PostCard
                title={job.title}
                type={job.employmentType}
                location={job.location}
                totalApplicants={totalApplicants}
                pendingApplicants={pendingApplicants}
              />
            );
          })}
          {jobs.length === 0 && <p className="text-white text-center">No job posts found.</p>}
        </div>
        <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default EmployerPostsPage;


