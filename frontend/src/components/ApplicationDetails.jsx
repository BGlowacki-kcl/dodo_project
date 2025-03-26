/**
 * ApplicationDetails.jsx
 *
 * This component displays detailed information about an application, including:
 * - Cover Letter
 * - Questions and Answers
 * - Code Assessment details
 */

import React, { useState } from "react";
import WhiteBox from "./WhiteBox";
import { FaFileAlt, FaQuestionCircle, FaCode } from "react-icons/fa";

const ApplicationDetails = ({
  coverLetter,
  questions,
  answers,
  codeAssessment,
  showCodeAssessment = true,
}) => {
  console.log("ApplicationDetails props:", {
    coverLetter,
    questions,
    answers,
    codeAssessment,
    showCodeAssessment,
  }); // Log all props

  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const toggleQuestion = (questionId) => {
    setExpandedQuestion((prev) => (prev === questionId ? null : questionId));
  };

  return (
    <div>
      {/* Cover Letter */}
      <WhiteBox className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaFileAlt className="mr-2" /> Cover Letter
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-dtext text-base leading-relaxed whitespace-pre-line m-0 font-serif">
            {coverLetter?.trim() || "No cover letter provided"}
          </p>
        </div>
      </WhiteBox>

      {/* Questions and Answers */}
      <WhiteBox className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaQuestionCircle className="mr-2" /> Questions and Answers
        </h2>
        {questions?.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => {
              const answer = answers.find(
                (ans) => ans.questionId === question._id
              );
              const isExpanded = expandedQuestion === question._id;

              return (
                <div
                  key={question._id}
                  className="border border-gray-300 rounded-lg overflow-hidden shadow-md"
                >
                  <button
                    onClick={() => toggleQuestion(question._id)}
                    className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {question.questionText}
                    </h3>
                  </button>
                  {isExpanded && (
                    <div className="p-4 bg-white">
                      <p className="text-base text-gray-700">
                        {answer?.answerText || "No answer provided"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No questions available for this job.
          </p>
        )}
      </WhiteBox>

      {/* Code Challenges */}
      {showCodeAssessment && (
        <WhiteBox className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaCode className="mr-2" /> Code Assessment
          </h2>
          {codeAssessment?.assessments &&
          codeAssessment.assessments.length > 0 ? (
            <div className="space-y-6">
              {codeAssessment.assessments.map((assessment) => {
                const submission = codeAssessment.submissions.find(
                  (sub) => sub.assessment === assessment._id
                );
                return (
                  <div
                    key={assessment._id}
                    className="bg-gray-50 p-4 rounded-lg shadow"
                  >
                    <h3 className="text-xl font-medium text-gray-800 mb-2">
                      {assessment.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {assessment.description}
                    </p>
                    {submission ? (
                      <div>
                        <h4 className="text-md font-semibold mb-2">
                          Submitted Code:
                        </h4>
                        <pre className="bg-black text-white p-4 rounded-lg overflow-auto">
                          {submission.solutionCode}
                        </pre>
                        <p className="mt-4 text-sm text-gray-700">
                          <strong>Score:</strong> {submission.score}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        No Submission Available
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No code challenges available.
            </p>
          )}
        </WhiteBox>
      )}
    </div>
  );
};

export default ApplicationDetails;
