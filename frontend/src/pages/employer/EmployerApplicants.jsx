import React, { useEffect, useState } from "react";
import EmployerSideBar from "../../components/EmployerSideBar";
import { useNavigate, useParams } from "react-router-dom";

const EmployerApplicants = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await fetch(`/api/application/job/${jobId}/applicants`);
                const data = await response.json();
                console.log('API Response:', data); // Debug log
                
                if (data.success) {
                    setApplicants(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch applicants');
                }
            } catch (error) {
                console.error('Error details:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchApplicants();
        }
    }, [jobId]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployerSideBar />

            <div className="flex-1 p-8 ml-64">
                <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">Applicants</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center">
                        <p className="text-gray-600">Loading applicants...</p>
                    </div>
                ) : applicants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applicants.map((applicant) => (
                            <div key={applicant.id} 
                                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-lg font-semibold">{applicant.name}</h3>
                                <p className="text-sm text-gray-600">Email: {applicant.email}</p>
                                <p className="text-sm text-gray-600"> Status: {applicant.status}</p>
                                
                                <div className="mt-4 flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/applicant/${applicant.id}`)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-600">
                        <p>No applicants found for this job posting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerApplicants;
