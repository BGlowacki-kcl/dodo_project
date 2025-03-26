import React from "react";
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
} from "react-icons/fa";

const JobDetailsContent = ({ job, isEmployer }) => {
  console.log("JobDetailsContent props:", { job, isEmployer }); // Log all props
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
        <WhiteBox className="text-center">
          <h3 className="text-base font-bold flex items-center justify-center">
            <FaMoneyBillWave className="mr-2" /> Salary
          </h3>
          <p>
            {job.salaryRange ? `£${job.salaryRange.min} - £${job.salaryRange.max}` : "Not specified"}
          </p>
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
      <WhiteBox className="mt-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center">
          <FaListAlt className="mr-2" /> Job Description
        </h2>
        <p>{job.description}</p>
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
    {isEmployer ? (
      job.questions && job.questions.length > 0 ? (
        <div className="space-y-4">
          {job.questions.map((question, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg overflow-hidden shadow-md"
            >
              <div className="w-full text-left px-4 py-3 bg-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  {question.questionText}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700">You did not add any questions for this job.</p>
      )
    ) : job.questions && job.questions.length > 0 ? (
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
    <p className="text-gray-700">
      {isEmployer
        ? job.assessments && job.assessments.length > 0
          ? "You have added a code assessment for this job."
          : "You did not add any code assessments for this job."
        : job.assessments && job.assessments.length > 0
        ? "Yes, this job requires taking an assessment during the application process."
        : "No, this job does not require taking an assessment during the application process."}
    </p>
  </WhiteBox>
</div>
    </div>
  );
};

export default JobDetailsContent;
