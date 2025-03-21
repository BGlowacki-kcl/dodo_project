import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applyToJob } from '../../services/applicationService';
import { getJobQuestionsById } from '../../services/jobService';
import { useNotification } from "../../context/notification.context";

const Apply = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [coverLetter, setCoverLetter] = useState("");
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const showNotification = useNotification();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const fetchedQuestions = await getJobQuestionsById(jobId);
                setQuestions(fetchedQuestions);
                console.log(fetchedQuestions);
                
                
            } catch (error) {
                showNotification("Failed to fetch job questions. Please try again.", "error");
            }
        };
        fetchQuestions();
    }, [jobId, showNotification]);

    const handleAnswerChange = (index, value) => {
        setAnswers((prev) => ({ ...prev, [index]: value }));
    };

    const handleSubmitApplication = async () => {
        try {
            const applicationData = {
                jobId,
                coverLetter,
                answers,
            };
            await applyToJob(applicationData);
            navigate(`/user/jobs/details/${jobId}`);
            showNotification("Application submitted successfully!", "success");
        } catch (error) {
            showNotification("Failed to submit application. Please try again.", "error");
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
                        {questions.map((question, index) => ( 
                            <div key={index} className="mb-4">
                                <label className="block text-gray-700 mb-2">{question.questionText}</label>
                                <input
                                    type="text"
                                    value={answers[index] || ""}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
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
            </div>
        </div>
    );
};

export default Apply;