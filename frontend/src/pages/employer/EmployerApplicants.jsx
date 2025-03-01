import React, { useEffect, useState } from "react";
import EmployerSideBar from "../../components/EmployerSideBar";
import { useNavigate } from "react-router-dom";

const EmployerApplicants = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await fetch("/api/applicants", {
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch applicants");
                }

                const data = await response.json();
                setApplicants(data.applicants);
            } catch (error) {
                console.error("Error fetching applicants:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployerSideBar />

            <div className="flex-1 p-8 ml-64">
                <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">Applicants</h1>

                {loading ? (
                    <p>Loading applicants...</p>
                ) : applicants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applicants.map((applicant) => (
                            <div key={applicant._id} className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-semibold">{applicant.name}</h3>
                                <p className="text-sm text-gray-600">Email: {applicant.email}</p>
                                <p className="text-sm text-gray-600">Job: {applicant.jobTitle}</p>
                                <button
                                    onClick={() => navigate(`/applicant/${applicant._id}`)}
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
