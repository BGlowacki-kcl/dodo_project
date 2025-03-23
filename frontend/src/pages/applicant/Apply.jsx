import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applyToJob, saveApplication, getApplicationById, getAllUserApplications, submitApplication, withdrawApplication } from '../../services/application.service';
import { getJobQuestionsById } from '../../services/job.service';
import { useNotification } from "../../context/notification.context";

const Apply = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [coverLetter, setCoverLetter] = useState("");
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true); // Add loading state
    const [applicationId, setApplicationId] = useState(null); // Track the existing application ID
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const showNotification = useNotification();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                showNotification("Fetching application details...", "info"); // Notify user
                const fetchedQuestions = await getJobQuestionsById(jobId);
                setQuestions(fetchedQuestions);
                console.log(fetchedQuestions);
            } catch (error) {
                showNotification("Failed to fetch job questions. Please try again.", "error");
            }
        };

        const fetchApplication = async () => {
            try {
            // Fetch all applications for the current user
            const allApplications = await getAllUserApplications();
            
            // Find the application corresponding to the current job
            const application = allApplications.find(app => app.job._id === jobId);
        
            if (!application) {
                console.error("No application found for this job.");
                return;
            }
        
            // Set the application ID for further operations
            setApplicationId(application._id);
        
            // Fetch detailed information about the application
            const applicationDetails = await getApplicationById(application._id);
        
            // If the application is in "applying" status, populate the form fields
            if (applicationDetails.status === "applying") {
                setCoverLetter(applicationDetails.coverLetter || ""); // Set cover letter
                setAnswers(
                (applicationDetails.answers || []).reduce((acc, { questionId, answerText }) => ({
                    ...acc,
                    [questionId]: answerText, // Map answers to their respective questions
                }), {})
                );
            }
            } catch (error) {
            // Log any errors that occur during the fetch process
            console.error("Error fetching application:", error);
            } finally {
            // Ensure loading state is set to false after the process completes
            setLoading(false);
            }
        };

        fetchQuestions();
        fetchApplication();
    }, [jobId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-700">Loading application details...</p>
            </div>
        );
    }

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmitApplication = async () => {
        try {
            // Ensure all questions are answered
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


            await submitApplication(applicationId); 
            navigate(`/user/jobs/details/${jobId}`);
            showNotification("Application submitted successfully!", "success");
        } catch (error) {
            console.error("Error submitting application:", error);
            showNotification(error.message || "Failed to submit application. Please try again.", "error");
        }
    };

    const handleSaveApplication = async () => {
        try {
            if (!applicationId) {
                showNotification("Application ID is missing. Please try again.", "error");
                return;
            }

            const applicationData = {
                applicationId, // Include applicationId to identify the application being saved
                jobId,
                coverLetter,
                answers: Object.entries(answers).map(([questionId, answerText]) => ({
                    questionId,
                    answerText,
                })),
            };

            await saveApplication(applicationData); // Save progress without changing status
            showNotification("Application saved successfully!", "success");
        } catch (error) {
            showNotification("Failed to save application. Please try again.", "error");
        }
    };

    const handleWithdraw = async () => {
        try {
            if (!applicationId) {
                showNotification("Application ID is missing. Please try again.", "error");
                return;
            }

            const message = await withdrawApplication(applicationId);
            showNotification(message, "success");
            navigate("/applicant-dashboard");
        } catch (error) {
            console.error(error);
            showNotification(error.message || "Failed to withdraw application.", "error");
        } finally {
            setShowModal(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
             <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Apply for Job</h1>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Cover Letter</label>
                    <textarea
                        rows={6}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Type your cover letter..."
                    />
                </div>
                {questions.length > 0 && (
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Questions</h2>
                        {questions.map((question) => ( 
                            <div key={question._id} className="mb-4">
                                <label className="block text-gray-700 mb-2">
                                    {question.questionText} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={answers[question._id] || ""}
                                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Type your answer..."
                                />
                            </div>
                        ))}
                    </div>
                )}
                <button
                    onClick={handleSubmitApplication}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                >
                    Submit Application
                </button>
                <button
                    onClick={handleSaveApplication}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200 mt-2"
                >
                    Save
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 mt-2"
                >
                    Withdraw
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4">Confirm Withdrawal</h2>
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to withdraw this application? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Apply;