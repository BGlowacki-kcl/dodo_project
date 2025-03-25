/**
 * Apply.jsx
 *
 * This component represents the Apply Page in the application. It allows users to:
 * - View and answer job-specific questions.
 * - Write a cover letter.
 * - Save their application progress.
 * - Submit or withdraw their application.
 *
 * The page fetches job questions and application details dynamically based on the job ID.
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  saveApplication,
  getApplicationById,
  getAllUserApplications,
  submitApplication,
  withdrawApplication,
} from "../../services/applicationService";
import { getJobQuestionsById } from "../../services/job.service";
import { useNotification } from "../../context/notification.context";
import WhiteBox from "../../components/WhiteBox";
import ModalMessages from "../../components/ModalMessages";
import { FaFileAlt, FaQuestionCircle } from "react-icons/fa";

const Apply = () => {
  // ----------------------------- State Variables -----------------------------
  const { jobId } = useParams();
  const navigate = useNavigate();
  const showNotification = useNotification();
  const [coverLetter, setCoverLetter] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches application data, including job questions and existing application details.
   * It retrieves the questions for the job and checks if the user has an ongoing application.
   * If an application exists, it pre-fills the form with the saved data.
   */
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        showNotification("Fetching application details...", "info");
        const [fetchedQuestions, allApplications] = await Promise.all([
          fetchJobQuestions(),
          fetchAllApplications(),
        ]);

        setQuestions(fetchedQuestions);

        const application = findApplication(allApplications);
        if (application) {
          await fetchApplicationDetails(application);
        }
      } catch (error) {
        showNotification("Failed to fetch application details. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [jobId]);

  /**
   * Fetches the list of questions associated with the current job.
   * @returns {Promise<Array>} - Array of question objects.
   */
  const fetchJobQuestions = async () => {
    return await getJobQuestionsById(jobId);
  };

  /**
   * Fetches all applications submitted by the current user.
   * @returns {Promise<Array>} - Array of application objects.
   */
  const fetchAllApplications = async () => {
    return await getAllUserApplications();
  };

  /**
   * Finds the application for the current job from the list of all user applications.
   * @param {Array} allApplications - List of all user applications.
   * @returns {Object|null} - The application object if found, otherwise null.
   */
  const findApplication = (allApplications) => {
    return allApplications.find((app) => app.job._id === jobId);
  };

  /**
   * Fetches the details of an existing application and updates the state with its data.
   * Pre-fills the cover letter and answers if the application is in the "applying" stage.
   * @param {Object} application - The application object.
   */
  const fetchApplicationDetails = async (application) => {
    setApplicationId(application._id);
    const applicationDetails = await getApplicationById(application._id);
    if (applicationDetails.status === "Applying") {
      setCoverLetter(applicationDetails.coverLetter || "");
      setAnswers(
        (applicationDetails.answers || []).reduce((acc, ans) => {
          acc[ans.questionId] = ans.answerText;
          return acc;
        }, {})
      );
    }
  };

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles changes to answers for job questions.
   * Updates the state with the new answer for the specified question.
   * @param {String} questionId - The ID of the question being answered.
   * @param {String} value - The answer text.
   */
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  /**
   * Saves the current application progress to the server.
   * Ensures that the application ID exists and sends the cover letter and answers.
   */
  const handleSaveApplication = async () => {
    try {
      if (!applicationId) {
        showNotification("Application ID is missing. Please try again.", "error");
        return;
      }

      const applicationData = {
        applicationId,
        jobId,
        coverLetter,
        answers: Object.entries(answers).map(([questionId, answerText]) => ({
          questionId,
          answerText,
        })),
      };

      await saveApplication(applicationData);
      showNotification("Application saved successfully!", "success");
    } catch (error) {
      showNotification("Failed to save application. Please try again.", "error");
    }
  };

  /**
   * Submits the application after validating all required fields.
   * Ensures that all questions are answered before submission.
   */
  const handleSubmitApplication = async () => {
    try {
      const unansweredQuestions = questions.filter(
        (question) => !answers[question._id] || answers[question._id].trim() === ""
      );

      if (unansweredQuestions.length > 0) {
        showNotification("Please answer all the questions before submitting.", "error");
        return;
      }

      if (!applicationId) {
        showNotification("Application ID is missing. Please try again.", "error");
        return;
      }

      await saveApplication({
        applicationId,
        jobId,
        coverLetter,
        answers: Object.entries(answers).map(([questionId, answerText]) => ({
          questionId,
          answerText,
        })),
      });

      await submitApplication(applicationId);
      showNotification("Application submitted successfully!", "success");
      navigate(`/user/jobs/details/${jobId}`);
    } catch (error) {
      showNotification("Failed to submit application. Please try again.", "error");
    }
  };

  /**
   * Withdraws the application by deleting it from the server.
   * Navigates the user back to the job details page after successful withdrawal.
   */
  const handleWithdrawApplication = async () => {
    try {
      if (!applicationId) {
        showNotification("Application ID is missing. Please try again.", "error");
        return;
      }

      await withdrawApplication(applicationId);
      showNotification("Application withdrawn successfully!", "success");
      navigate(`/user/jobs/details/${jobId}`);
    } catch (error) {
      showNotification("Failed to withdraw application. Please try again.", "error");
    } finally {
      setShowModal(false);
    }
  };

  // ----------------------------- Render -----------------------------
  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <p className="text-white">Loading application details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-left text-black">Apply for the Job</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
          >
            Withdraw Application
          </button>
        </div>

        {/* Cover Letter and Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WhiteBox className="h-[30rem] flex flex-col justify-between">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FaFileAlt className="mr-2" /> Cover Letter <span className="text-sm text-gray-500 italic">- Optional</span>
            </h2>
            <textarea
              rows={10}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded flex-grow resize-none"
              placeholder="Type your cover letter..."
            />
          </WhiteBox>
          <WhiteBox className="h-[30rem] flex flex-col justify-between">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FaQuestionCircle className="mr-2" /> Questions
            </h2>
            {questions.length > 0 ? (
              <div className="flex flex-col justify-between flex-grow">
                <div>
                  <p className="text-lg font-medium mb-4">
                    {questions[currentQuestionIndex].questionText}
                  </p>
                  <textarea
                    rows={11}
                    value={answers[questions[currentQuestionIndex]._id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(questions[currentQuestionIndex]._id, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded resize-none"
                    placeholder="Type your answer..."
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-lg ${
                      currentQuestionIndex === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(prev + 1, questions.length - 1)
                      )
                    }
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentQuestionIndex === questions.length - 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 italic">No questions for this job.</p>
              </div>
            )}
          </WhiteBox>
        </div>

        {/* Save and Submit Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={handleSaveApplication}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Save
          </button>
          <button
            onClick={handleSubmitApplication}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Submit Application
          </button>
        </div>
      </div>

      {/* Modal for Withdrawal Confirmation */}
      <ModalMessages
        show={showModal}
        onClose={() => setShowModal(false)}
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        onConfirm={handleWithdrawApplication}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Apply;