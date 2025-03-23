import React from "react";

const ExtractApplication = ({ coverLetter, questions, answers, codeChallenge }) => {
  return (
    <div>
      {/* Cover Letter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Cover Letter</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 whitespace-pre-line">{coverLetter || "No cover letter provided"}</p>
        </div>
      </div>

      {/* Questions and Answers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Questions and Answers</h2>
        {questions?.length > 0 ? (
          <ul className="list-disc pl-6">
            {questions.map((question, index) => {
              const answer = answers.find((ans) => ans.questionId === question._id);
              return (
                <li key={question._id} className="mb-4">
                  <p className="font-medium text-gray-800">
                    <strong>Question:</strong> {question.questionText}
                  </p>
                  <p className="text-gray-700">
                    <strong>Answer:</strong> {answer?.answerText || "No answer provided"}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No questions available for this job.</p>
        )}
      </div>

      {/* Code Challenges */}
      {codeChallenge?.assessments?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Code Challenges</h2>
          <div className="space-y-6">
            {codeChallenge.assessments.map((assessment) => {
              const submission = codeChallenge.submissions.find(
                (sub) => sub.assessment === assessment._id
              );
              return (
                <div key={assessment._id} className="bg-gray-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{assessment.title}</h3>
                  <p className="text-gray-600 mb-4">{assessment.description}</p>
                  {submission ? (
                    <div>
                      <h4 className="text-md font-semibold mb-2">Submitted Code:</h4>
                      <pre className="bg-black text-white p-4 rounded-lg overflow-auto">
                        {submission.solutionCode}
                      </pre>
                      <p className="mt-4 text-sm text-gray-700">
                        <strong>Score:</strong> {submission.score}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No submission available</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractApplication;
