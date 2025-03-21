import React, { useEffect, useState } from "react";
import EmployerSideBar from "../../components/EmployerSideBar";
import { useNavigate, useParams } from "react-router-dom";
import { getJobApplicants } from "../../services/applicationService";

const EmployerApplicants = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await getJobApplicants(jobId);
                console.log(response);
                setApplicants(response);
            } catch (err) {
                setError(err.message);
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
                <h1 className="text-2xl font-bold mb-6">Applicants for Job ID: {jobId}</h1>

                {loading && (
                    <div className="flex justify-center items-center">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && applicants.length === 0 && (
                    <p className="text-gray-600">No applicants found.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applicants.map((applicant) => (
                        <div
                            key={applicant._id}
                            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                        >
                            <h2 className="text-xl font-semibold text-gray-800">{applicant.name}</h2>
                            <p className="text-gray-600">{applicant.email}</p>
                            <p className="text-gray-500 mt-2">
                                <span className="font-medium">Status:</span>{" "}
                                {applicant.status || "No cover letter provided"}
                            </p>
                            <button
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                onClick={() => navigate(`/applicant/${applicant.applicationId}`)}
                            >
                                View Application
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmployerApplicants;
