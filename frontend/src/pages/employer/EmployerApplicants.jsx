import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployerSideBar from "../../components/EmployerSideBar";

const EmployerApplicants = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { jobId } = useParams(); // Extract jobId from the URL

    useEffect(() => {
        if (!jobId) {
            setError("❌ Error: Job ID is missing.");
            setLoading(false);
            return;
        }

        const fetchApplicants = async () => {
            try {
                console.log(`Fetching applicants for Job ID: ${jobId}`);

                const token = sessionStorage.getItem("token");
                if (!token) {
                    throw new Error("Authentication token is missing.");
                }

                const response = await fetch(`http://localhost:5000/api/application/job/${jobId}/applicants`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch applicants: ${errorText}`);
                }

                const data = await response.json();
                setApplicants(data.data || []);

            } catch (error) {
                console.error("Error fetching applicants:", error);
                setError(error.message || "Failed to fetch applicants.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [jobId]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployerSideBar />

            <div className="flex-1 p-8 ml-64">
                <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">Applicants</h1>

                {loading ? (
                    <p className="text-gray-600">🔄 Loading applicants...</p>
                ) : error ? (
                    <p className="text-red-600 font-semibold">{error}</p>
                ) : applicants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applicants.map((applicant) => (
                            <div key={applicant._id} className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-semibold">{applicant.name}</h3>
                                <p className="text-sm text-gray-600">📧 Email: {applicant.email}</p>
                                <p className="text-sm text-gray-600">💼 Job: {applicant.jobTitle || "N/A"}</p>

                                <button
                                    onClick={() => navigate(`/applicant/${applicant._id}`)}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">⚠️ No applicants found for this job.</p>
                )}
            </div>
        </div>
    );
};

export default EmployerApplicants;
