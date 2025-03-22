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
 * 
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById } from "../../services/jobService";
import { getAllUserApplications, applyToJob } from "../../services/applicationService";
import { getShortlist, addJobToShortlist, removeJobFromShortlist } from "../../services/shortlist.service";
import WhiteBox from "../../components/WhiteBox";

const JobDetailsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

    // Fetch job details
  const fetchJobDetails = async (jobId) => {
    const jobData = await getJobById(jobId);
    setJob(jobData);
  };

  // Fetch user applications and check if the user has applied for the job
  const fetchUserApplications = async (jobId) => {
    const userApps = await getAllUserApplications();
    const application = userApps.find((app) => app.job?._id === jobId);
    if (application) {
      setApplied(true);
      setApplicationStatus(application.status);
    } else {
      setApplied(false);
      setApplicationStatus(null);
    }
  };

  // Fetch shortlist and check if the job is shortlisted
  const fetchShortlist = async (jobId) => {
    const shortlist = await getShortlist();
    const shortlistedJobIds = shortlist.jobs.map((job) => job._id);
    setShortlisted(shortlistedJobIds.includes(jobId));
  };

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      await Promise.all([
        fetchJobDetails(jobId),
        fetchUserApplications(jobId),
        fetchShortlist(jobId),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Handle toggling shortlist status
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

  // Handle applying for the job
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

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [jobId]);

  if (!job) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <p className="text-white">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-left text-black">Job Details</h1>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg shadow-md">
              <span className="font-semibold text-gray-700 mr-2">Deadline:</span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                job.deadline ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}>
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString("en-GB")
                  : "No deadline"}
              </span>
            </div>
            <div className="flex space-x-4">
              {applied ? (
                applicationStatus === "applying" ? (
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
        <div className="grid grid-cols-6 gap-4 mb-6">
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Job Title</h3>
            <p>{job.title}</p>
          </WhiteBox>
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Company</h3>
            <p>{job.company}</p>
          </WhiteBox>
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Location</h3>
            <p>{job.location}</p>
          </WhiteBox>
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Salary</h3>
            <p>
              {job.salaryRange ? `£${job.salaryRange.min} - £${job.salaryRange.max}` : "Not specified"}
            </p>
          </WhiteBox>
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Employment Type</h3>
            <p>{job.employmentType}</p>
          </WhiteBox>
          <WhiteBox className="text-center">
            <h3 className="text-base font-bold">Experience Level</h3>
            <p>{job.experienceLevel || "Not specified"}</p>
          </WhiteBox>
        </div>

        <WhiteBox className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">Job Description</h2>
          <p>{job.description}</p>
        </WhiteBox>

        <WhiteBox className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">Requirements</h2>
          {job.requirements && job.requirements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((req, index) => (
                <span 
                  key={index} 
                  className="bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-800 font-medium"
                >
                  {req}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No requirements needed</p>
          )}
        </WhiteBox>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <WhiteBox>
            <h2 className="text-xl font-semibold mb-2">Questions?</h2>
            <p className="text-gray-700">{job.questions && job.questions.length > 0 ? "Yes, this job requires answering questions during the application process." : "No, this job does not require answering questions during the application process."}</p>
          </WhiteBox>
          <WhiteBox>
            <h2 className="text-xl font-semibold mb-2">Code Assessment?</h2>
            <p className="text-gray-700">{job.assessments && job.assessments.length > 0 ? "Yes, this job requires taking an assessment during the application process." : "No, this job does not require taking an assessment during the application process."}</p>
          </WhiteBox>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
