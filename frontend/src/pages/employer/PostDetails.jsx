/**
 * PostDetails.jsx
 *
 * This component represents the Post Details page in the application. It provides:
 * - Tabs to view statistics, applicants, and job post details.
 * - The ability to edit and save the job post deadline.
 * - Displays job-specific data such as applicants and statistics.
 */

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostStatistics from "../../components/PostStatistics";
import EmployerApplicants from "../../components/EmployerApplicants";
import JobDetailsContent from "../../components/JobDetailsContent";
import { getJobById, updateJob } from "../../services/job.service.js";
import DeadlineBadge from "../../components/DeadlineBadge";
import { FaEdit, FaSave } from "react-icons/fa";

const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="flex space-x-2 bg-gray-100 p-2 rounded-full shadow-md">
    <button
      onClick={() => setActiveTab("statistics")}
      className={`px-8 py-2 rounded-full font-medium transition-all duration-300 ${
        activeTab === "statistics"
          ? "bg-blue-600 text-white shadow"
          : "text-gray-800 hover:bg-gray-200"
      }`}
    >
      Statistics
    </button>
    <button
      onClick={() => setActiveTab("applicants")}
      className={`px-8 py-2 rounded-full font-medium transition-all duration-300 ${
        activeTab === "applicants"
          ? "bg-blue-600 text-white shadow"
          : "text-gray-800 hover:bg-gray-200"
      }`}
    >
      Applicants
    </button>
    <button
      onClick={() => setActiveTab("post")}
      className={`px-8 py-2 rounded-full font-medium transition-all duration-300 ${
        activeTab === "post"
          ? "bg-blue-600 text-white shadow"
          : "text-gray-800 hover:bg-gray-200"
      }`}
    >
      Post
    </button>
  </div>
);

const PostDetails = () => {
  // ----------------------------- State Variables -----------------------------
  const { jobId } = useParams();
  const [activeTab, setActiveTab] = useState("statistics");
  const [job, setJob] = useState(null);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");

  const isDeadlinePassed = job?.deadline && new Date(job.deadline) < new Date();

  // ----------------------------- Effects -----------------------------
  /**
   * Effect to fetch job details when the component mounts or jobId changes.
   */
  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches job details by job ID.
   */
  const fetchJobDetails = async () => {
    try {
      const jobData = await getJobById(jobId);
      setJob(jobData);
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  };

  // ----------------------------- Handlers -----------------------------
  /**
   * Enables editing mode for the job deadline.
   */
  const handleEditDeadline = () => {
    setIsEditingDeadline(true);
    setNewDeadline(job?.deadline?.split("T")[0] || "");
  };

  /**
   * Saves the updated job deadline.
   */
  const handleSaveDeadline = async () => {
    try {
      const updatedJob = await updateJob(jobId, { deadline: newDeadline });
      setJob(updatedJob);
      setIsEditingDeadline(false);
    } catch (error) {
      console.error("Error updating deadline:", error);
    }
  };

  // ----------------------------- Render Helpers -----------------------------
  /**
   * Renders the content for the active tab.
   */
  const renderContent = () => {
    switch (activeTab) {
      case "statistics":
        return <PostStatistics jobId={jobId} />;
      case "applicants":
        return <EmployerApplicants jobId={jobId} />;
      case "post":
        return <JobDetailsContent job={job} isEmployer={!isDeadlinePassed} />;
      default:
        return null;
    }
  };

  // ----------------------------- Render -----------------------------
  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-10">
        {/* Title, Deadline, and Navigation Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            {/* Title */}
            <h1 className="text-4xl font-bold">Post Details</h1>
            {/* Deadline and Edit Button Group */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                {isEditingDeadline ? (
                  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg shadow-md">
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      min={job?.deadline?.split("T")[0]}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      disabled={isDeadlinePassed}
                    />
                    <button
                      onClick={handleSaveDeadline}
                      className="text-black hover:text-gray-700 ml-2"
                      title="Save Deadline"
                      disabled={isDeadlinePassed}
                    >
                      <FaSave />
                    </button>
                  </div>
                ) : (
                  <>
                    <DeadlineBadge deadline={job?.deadline} />
                    {activeTab === "post" && !isDeadlinePassed && (
                      <button
                        onClick={handleEditDeadline}
                        className="text-black hover:text-gray-700"
                        title="Edit Deadline"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Tabs */}
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content */}
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

export default PostDetails;