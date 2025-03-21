import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applyToJob, saveApplication, getApplicationById, getAllUserApplications, submitApplication } from '../../services/applicationService';
import { getJobQuestionsById } from '../../services/jobService';
import { useNotification } from "../../context/notification.context";

const Apply = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [coverLetter, setCoverLetter] = useState("");
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true); // Add loading state
    const [applicationId, setApplicationId] = useState(null); // Track the existing application ID
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
            if (!applicationId) {
                showNotification("Application ID is missing. Please try again.", "error");
                return;
            }

            await submitApplication(applicationId); // Use the new service to submit the application
            navigate(`/user/jobs/details/${jobId}`);
            showNotification("Application submitted successfully!", "success");
        } catch (error) {
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
                                <label className="block text-gray-700 mb-2">{question.questionText}</label>
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
            </div>
        </div>
    );
};

export default Apply;