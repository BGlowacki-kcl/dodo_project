import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployerSideBar from "../../components/EmployerSideBar";
import { getApplicantsByJobId, getJobById } from "../../services/jobService";

const EmployerApplicants = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch job details
                const job = await getJobById(jobId);
                setJobDetails(job);
                
                // Fetch applicants for this job
                const applicantsData = await getApplicantsByJobId(jobId);
                // Ensure we have an array even if the response is null or undefined
                setApplicants(applicantsData || []);
                
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(`Failed to load applicants: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
    
        if (jobId) {
            fetchData();
        }
    }, [jobId]);

    const handleApplicantClick = (applicantId) => {
        navigate(`/applicant/${applicantId}`);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployerSideBar />
            
            <div className="flex-1 p-8 ml-64">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
                >
                    <span>← Back to Jobs</span>
                </button>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-600">Loading applicants...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Applicants for {jobDetails?.title}
                            </h1>
                            <p className="text-gray-600">
                                Total Applicants: {applicants?.length || 0}
                            </p>
                        </div>
                        
                        {applicants?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {applicants.map((applicant) => (
                                    <div 
                                        key={applicant._id}
                                        onClick={() => handleApplicantClick(applicant._id)}
                                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-800">{applicant.name}</h2>
                                                <p className="text-gray-600">{applicant.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                                                View Details
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <p className="text-lg text-gray-600">No applicants yet for this position.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EmployerApplicants;