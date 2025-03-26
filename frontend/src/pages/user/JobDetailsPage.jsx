/**
 * JobDetailsPage.jsx
 *
 * This component represents the Job Details Page in the application. It displays detailed information
 * about a specific job, including its title, company, location, salary range, employment type, experience level,
 * description, requirements, and additional details like questions or assessments required for the application.
 *
 * Users can interact with the page to:
 * - View job details.
 * - Apply for the job.
 * - Add or remove the job from their shortlist.
 * - Continue an ongoing application if already started.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../../services/job.service.js";
import { getAllUserApplications, applyToJob } from "../../services/application.service.js";
import { getShortlist, addJobToShortlist, removeJobFromShortlist } from "../../services/shortlist.service";
import JobDetailsContent from "../../components/JobDetailsContent";
import WhiteBox from "../../components/WhiteBox";
import { FaQuestionCircle, FaCode } from "react-icons/fa";
import DeadlineBadge from "../../components/DeadlineBadge";

const JobDetailsPage = () => {
  // ----------------------------- State Variables -----------------------------
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches job details, user applications, and shortlist data.
   */
  const fetchData = async () => {
    try {
      const jobData = await getJobById(jobId);
      setJob(jobData);

      const userApps = await getAllUserApplications();
      const application = userApps.find((app) => app.job?._id === jobId);
      setApplied(!!application);
      setApplicationStatus(application?.status || null);

      const shortlist = await getShortlist();
      const shortlistedJobIds = shortlist.jobs.map((job) => job._id);
      setShortlisted(shortlistedJobIds.includes(jobId));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // ----------------------------- Handlers -----------------------------
  /**
   * Toggles the job's shortlist status.
   */
  const handleShortlistToggle = async () => {
    try {
      if (shortlisted) {
        await removeJobFromShortlist(jobId);
      } else {
        await addJobToShortlist(jobId);
      }
      setShortlisted(!shortlisted);
    } catch (err) {
      console.error("Error updating shortlist:", err);
    }
  };

  /**
   * Handles the job application process.
   */
  const handleApply = async () => {
    try {
      if (!applied) {
        await applyToJob({ jobId, coverLetter: "", answers: [] });
      }
      navigate(`/apply/${jobId}`);
    } catch (err) {
      console.error("Error applying to job:", err);
    }
  };

  // ----------------------------- Effects -----------------------------
  /**
   * Effect to fetch job data when the component mounts or jobId changes.
   */
  useEffect(() => {
    fetchData();
  }, [jobId]);

  // ----------------------------- Render -----------------------------
  if (!job) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <p className="text-white">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-4 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-left text-black">Job Details</h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <DeadlineBadge deadline={job.deadline} />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              {applied ? (
                applicationStatus === "Applying" ? (
                  <button
                    onClick={() => navigate(`/apply/${jobId}`)}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 shadow-md"
                  >
                    Continue Application
                  </button>
                ) : (
                  <div className="px-6 py-2 bg-green-100 text-green-700 rounded-lg shadow-md font-semibold">
                    Application Submitted
                  </div>
                )
              ) : (
                <button
                  onClick={handleApply}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                >
                  Apply Now
                </button>
              )}
              <button
                onClick={handleShortlistToggle}
                className={`px-6 py-2 rounded-lg shadow-md ${
                  shortlisted
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                } transition duration-200`}
              >
                {shortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
              </button>
            </div>
          </div>
        </div>

        {/* Job Details Content */}
        <JobDetailsContent job={job} />
      </div>
    </div>
  );
};

export default JobDetailsPage;