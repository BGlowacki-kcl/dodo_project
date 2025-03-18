import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applyToJob } from '../../services/applicationService';
import { useNotification } from "../../context/notification.context";


const Apply = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [coverLetter, setCoverLetter] = useState("");
    const showNotification = useNotification();

   
    const handleSubmitApplication = async () => {
        try {
            // Assume submitApplication is a function that submits the application
            await applyToJob({ jobId, coverLetter });
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