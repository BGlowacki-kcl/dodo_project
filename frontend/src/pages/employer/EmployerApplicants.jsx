import React, { useEffect, useState } from "react";
import EmployerSideBar from "../../components/EmployerSideBar";
import { useNavigate, useLocation } from "react-router-dom";

const EmployerApplicants = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const jobId = queryParams.get("jobId");

        if (!jobId) {
            setError("Job ID is missing.");
            setLoading(false);
            return;
        }

        const fetchApplicants = async () => {
            try {
                console.log("Fetching applicants for Job ID:", jobId);

                const token = sessionStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found.");
                }

                const response = await fetch(`http://localhost:5001/api/application/job/${jobId}/applicants`, {
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
                console.log("Applicants received:", data);
                setApplicants(data.data || []);

            } catch (error) {
                console.error("Error fetching applicants:", error);
                setError("Failed to fetch applicants.");
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [location.search]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployerSideBar />

            <div className="flex-1 p-8 ml-64">
                <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">Applicants</h1>

                {loading ? (
                    <p>Loading applicants...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : applicants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applicants.map((applicant) => (
                            <div key={applicant.id || applicant._id} className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-semibold">{applicant.name}</h3>
                                <p className="text-sm text-gray-600">Email: {applicant.email}</p>
                                <p className="text-sm text-gray-600">Job: {applicant.jobTitle || "N/A"}</p>
                                <button
                                    onClick={() => navigate(`/applicant/${applicant.id || applicant._id}`)}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No applicants found.</p>
                )}
            </div>
        </div>
    );
};

export default EmployerApplicants;
