import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJobApplicants } from "../services/applicationService";
import WhiteBox from "./WhiteBox";
import StatusBadge from "./StatusBadge";
import Pagination from "./Pagination";

const EmployerApplicants = () => {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [showStatusPopup, setShowStatusPopup] = useState(false);
    const [sortOrder, setSortOrder] = useState("asc"); // Default to "Oldest First"
    const applicantsPerPage = 10;
    const navigate = useNavigate();

    const statuses = ["Applied", "In Review", "Shortlisted", "Rejected", "Accepted"];

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await getJobApplicants(jobId);

                // Sort applicants by "Oldest First" by default
                const sortedApplicants = [...response].sort((a, b) => {
                    const dateA = new Date(a.submittedAt);
                    const dateB = new Date(b.submittedAt);
                    return dateA - dateB; // Ascending order
                });

                setApplicants(sortedApplicants);
                setFilteredApplicants(sortedApplicants); // Initially show all applicants
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [jobId]);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleRowClick = (applicationId) => {
        navigate(`/applicant/${applicationId}`);
    };

    const handleStatusClick = (status) => {
        setFilteredApplicants(
            status ? applicants.filter((applicant) => applicant.status === status) : applicants
        );
        setShowStatusPopup(false); // Close the pop-up after selecting a status
    };

    const handleSortClick = () => {
        const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newSortOrder);

        const sortedApplicants = [...filteredApplicants].sort((a, b) => {
            const dateA = new Date(a.submittedAt);
            const dateB = new Date(b.submittedAt);
            return newSortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        setFilteredApplicants(sortedApplicants);
    };

    const offset = currentPage * applicantsPerPage;
    const currentApplicants = filteredApplicants.slice(offset, offset + applicantsPerPage);
    const pageCount = Math.ceil(filteredApplicants.length / applicantsPerPage);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <WhiteBox className="flex flex-col">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-800 border-b">Name</th>
                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-800 border-b">Email</th>
                            <th
                                className="px-6 py-4 text-left text-lg font-semibold text-gray-800 border-b cursor-pointer relative"
                                onClick={() => setShowStatusPopup(!showStatusPopup)}
                            >
                                Status
                                {showStatusPopup && (
                                    <div className="absolute top-10 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                        <ul className="p-2">
                                            <li
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleStatusClick(null)}
                                            >
                                                All
                                            </li>
                                            {statuses.map((status) => (
                                                <li
                                                    key={status}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleStatusClick(status)}
                                                >
                                                    {status}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </th>
                            <th
                                className="px-6 py-4 text-left text-lg font-semibold text-gray-800 border-b cursor-pointer"
                                onClick={handleSortClick}
                            >
                                Date of Submission{" "}
                                <span>
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentApplicants.length > 0 ? (
                            currentApplicants.map((applicant, index) => (
                                <tr
                                    key={applicant.id}
                                    className={`${
                                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    } hover:bg-blue-50 transition-colors cursor-pointer`}
                                    onClick={() => handleRowClick(applicant.applicationId)}
                                >
                                    <td className="px-6 py-4 text-base text-gray-900 border-b">{applicant.name}</td>
                                    <td className="px-6 py-4 text-base text-gray-600 border-b">{applicant.email}</td>
                                    <td className="px-6 py-4 text-base border-b">
                                        <StatusBadge
                                            status={applicant.status}
                                            size="w-40 h-6"
                                            fontSize="text-sm"
                                            padding="px-15 py-5"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-base text-gray-600 border-b">
                                        {new Date(applicant.submittedAt).toLocaleDateString("en-GB")}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="px-6 py-4 text-center text-base text-gray-600 border-b"
                                >
                                    No applicants found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="mt-4">
                    <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
                </div>
            </WhiteBox>
        </>
    );
};

export default EmployerApplicants;