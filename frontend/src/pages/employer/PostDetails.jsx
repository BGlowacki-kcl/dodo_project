import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostStatistics from "../../components/PostStatistics";
import EmployerApplicants from "../../components/EmployerApplicants";
import JobDetailsContent from "../../components/JobDetailsContent";
import { getJobById } from "../../services/jobService";

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
        return <JobDetailsContent job={job} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-10">
        {/* Title and Navigation Tabs */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Post Details</h1>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content */}
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

export default PostDetails;