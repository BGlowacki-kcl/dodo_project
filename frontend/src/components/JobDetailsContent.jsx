/**
 * JobDetailsContent.jsx
 *
 * This component displays detailed information about a job, including:
 * - Job title, company, location, salary, employment type, and experience level.
 * - Editable fields for employers to update job description and salary range.
 * - Requirements, questions, and code assessments associated with the job.
 */

import React, { useState } from "react";
import WhiteBox from "./WhiteBox";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBriefcase,
  FaUserTie,
  FaFileAlt,
  FaListAlt,
  FaClipboardList,
  FaQuestionCircle,
  FaCode,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { updateJob } from "../services/job.service";

const JobDetailsContent = ({ job, isEmployer }) => {
  // ----------------------------- State Variables -----------------------------
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(job?.description || "");
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [editedSalary, setEditedSalary] = useState({
    min: job?.salaryRange?.min || "",
    max: job?.salaryRange?.max || "",
  });

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles saving the updated job description.
   */
  const handleSaveDescription = async () => {
    try {
      const updatedJob = await updateJob(job._id, { description: editedDescription });
      job.description = updatedJob.description; // Update local state
      setIsEditingDescription(false); // Exit edit mode
    } catch (error) {
      alert("Failed to save the job description. Please try again.");
    }
  };

  /**
   * Handles saving the updated salary range.
   */
  const handleSaveSalary = async () => {
    try {
      const updatedJob = await updateJob(job._id, { salaryRange: editedSalary });
      job.salaryRange = updatedJob.salaryRange; // Update local state
      setIsEditingSalary(false); // Exit edit mode
    } catch (error) {
      alert("Failed to save the salary range. Please try again.");
    }
  };

  // ----------------------------- Render -----------------------------
  if (!job) {
    return <p className="text-center text-gray-500">No job details available.</p>;
  }

  return (
    <div>
      {/* Job Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <WhiteBox className="text-center">
          <h3 className="text-base font-bold flex items-center justify-center">
            <FaFileAlt className="mr-2" /> Job Title
          </h3>
          <p>{job.title}</p>
        </WhiteBox>
        <WhiteBox className="text-center">
          <h3 className="text-base font-bold flex items-center justify-center">
            <FaBuilding className="mr-2" /> Company
          </h3>
          <p>{job.company}</p>
        </WhiteBox>
        <WhiteBox className="text-center">
          <h3 className="text-base font-bold flex items-center justify-center">
            <FaMapMarkerAlt className="mr-2" /> Location
          </h3>
          <p>{job.location}</p>
        </WhiteBox>
        <WhiteBox className="text-center relative">
          <div className="flex items-center justify-center">
            <h3 className="text-base font-bold flex items-center">
              <FaMoneyBillWave className="mr-2" /> Salary
            </h3>
            {isEmployer && (
              <button
                className="absolute right-4 text-black hover:text-gray-800"
                onClick={() => {
                  if (isEditingSalary) {
                    handleSaveSalary();
                  } else {
                    setEditedSalary({
                      min: job.salaryRange?.min || "",
                      max: job.salaryRange?.max || "",
                    });
                    setIsEditingSalary(true);
                  }
                }}
              >
                {isEditingSalary ? <FaSave /> : <FaEdit />}
              </button>
            )}
          </div>
          {isEditingSalary ? (
            <div className="flex flex-col gap-2 mt-2">
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Min Salary"
                value={editedSalary.min}
                onChange={(e) =>
                  setEditedSalary((prev) => ({ ...prev, min: e.target.value }))
                }
              />
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Max Salary"
                value={editedSalary.max}
                onChange={(e) =>
                  setEditedSalary((prev) => ({ ...prev, max: e.target.value }))
                }
              />
            </div>
          ) : (
            <p className="mt-0.5">
              {job.salaryRange
                ? `£${job.salaryRange.min} - £${job.salaryRange.max}`
                : "Not specified"}
            </p>
          )}
        </WhiteBox>
        <WhiteBox className="text-center">
          <h3 className="text-base font-bold flex items-center justify-center">
            <FaBriefcase className="mr-2" /> Employment Type
          </h3>
          <p>{job.employmentType}</p>
        </WhiteBox>
        <WhiteBox className="text-center">
          <h3 className="text-base font-bold flex items-center justify-center">
            <FaUserTie className="mr-2" /> Experience Level
          </h3>
          <p>{job.experienceLevel || "Not specified"}</p>
        </WhiteBox>
      </div>

      {/* Job Description */}
      <WhiteBox className="mt-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold flex items-center">
            <FaListAlt className="mr-2" /> Job Description
          </h2>
          {isEmployer && (
            <button
              className="text-black hover:text-gray-800"
              onClick={() => {
                if (isEditingDescription) {
                  handleSaveDescription();
                } else {
                  setEditedDescription(job.description || "");
                  setIsEditingDescription(true);
                }
              }}
            >
              {isEditingDescription ? <FaSave /> : <FaEdit />}
            </button>
          )}
        </div>
        {isEditingDescription ? (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        ) : (
          <p>{job.description}</p>
        )}
      </WhiteBox>

      {/* Requirements */}
      <WhiteBox className="mt-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
          <FaClipboardList className="mr-2" /> Requirements
        </h2>
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

      {/* Questions and Code Assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <WhiteBox>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
            <FaQuestionCircle className="mr-2" /> Questions?
          </h2>
          {job.questions && job.questions.length > 0 ? (
            <p className="text-gray-700">
              Yes, this job requires answering questions during the application process.
            </p>
          ) : (
            <p className="text-gray-700">
              No, this job does not require answering questions during the application process.
            </p>
          )}
        </WhiteBox>
        <WhiteBox>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
            <FaCode className="mr-2" /> Code Assessment?
          </h2>
          {job.assessments && job.assessments.length > 0 ? (
            <p className="text-gray-700">
              Yes, this job requires taking an assessment during the application process.
            </p>
          ) : (
            <p className="text-gray-700">
              No, this job does not require taking an assessment during the application process.
            </p>
          )}
        </WhiteBox>
      </div>
    </div>
  );
};

export default JobDetailsContent;