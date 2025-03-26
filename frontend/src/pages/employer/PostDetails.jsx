import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostStatistics from "../../components/PostStatistics";
import EmployerApplicants from "../../components/EmployerApplicants";
import JobDetailsContent from "../../components/JobDetailsContent";
import { getJobById, updateJob } from "../../services/jobService"; // Use updateJob
import DeadlineBadge from "../../components/DeadlineBadge";
import { FaEdit, FaSave } from "react-icons/fa"; // Import edit and save icons

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
  const { jobId } = useParams();
  const [activeTab, setActiveTab] = useState("statistics");
  const [job, setJob] = useState(null);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState("");

  const isDeadlinePassed = job?.deadline && new Date(job.deadline) < new Date();

  const handleEditDeadline = () => {
    setIsEditingDeadline(true);
    setNewDeadline(job?.deadline?.split("T")[0] || ""); // Pre-fill with the current deadline (formatted as YYYY-MM-DD)
  };

  const handleSaveDeadline = async () => {
    try {
      const updatedJob = await updateJob(jobId, { deadline: newDeadline }); // Use updateJob service
      setJob(updatedJob); // Update the job with the new deadline
      setIsEditingDeadline(false);
    } catch (error) {
      console.error("Error updating deadline:", error);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getJobById(jobId);
        setJob(jobData);
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchJob();
  }, [jobId]);

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
                      min={job?.deadline?.split("T")[0]} // Restrict to dates after the current deadline
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      disabled={isDeadlinePassed} // Disable input if deadline has passed
                    />
                    <button
                      onClick={handleSaveDeadline}
                      className="text-black hover:text-gray-700 ml-2"
                      title="Save Deadline"
                      disabled={isDeadlinePassed} // Disable save button if deadline has passed
                    >
                      <FaSave />
                    </button>
                  </div>
                ) : (
                  <>
                    <DeadlineBadge deadline={job?.deadline} />
                    {activeTab === "post" && !isDeadlinePassed && ( // Only show edit button if "post" tab is active and deadline has not passed
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