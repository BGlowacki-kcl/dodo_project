/**
 * Activity.jsx
 *
 * This component displays the user's activity, including:
 * - Statistics for applications sent, rejections, and acceptances.
 * - A list of the user's applications with the ability to continue ongoing applications.
 */

import React, { useEffect, useState } from "react";
import { getAllUserApplications } from "../services/application.service.js";
import ApplicationCards from "./ApplicationCards";
import { FaFolderOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import WhiteBox from "./WhiteBox";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar.jsx"
import { FaFilter } from "react-icons/fa";;
import ActivityFilter from "../components/filters/ActivityFilter";

const ApplicantActivity = ({ userId }) => {
  // ----------------------------- State Variables -----------------------------
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]); // For filtered results
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [applicationsSent, setApplicationsSent] = useState(0);
  const [rejections, setRejections] = useState(0);
  const [acceptances, setAcceptances] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Filter modal state
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // ----------------------------- Effects -----------------------------
  useEffect(() => {
    fetchApplications();
  }, [userId]);

  useEffect(() => {
    // Filter applications based on the search query
    const filtered = applications.filter((app) =>
      app.job?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredApplications(filtered);
  }, [searchQuery, applications]);

  // ----------------------------- Data Fetching -----------------------------
  const fetchApplications = async () => {
    try {
      const applications = await getAllUserApplications(userId);
      setApplications(applications);
      setFilteredApplications(applications); // Initialize filtered applications
      setApplicationsSent(applications.length);
      setRejections(applications.filter((app) => app.status === "Rejected").length);
      setAcceptances(applications.filter((app) => app.status === "Accepted").length);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  // ----------------------------- Handlers -----------------------------
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleSearch = (query) => {
    setSearchQuery(query); // Update the search query
  };

  // ----------------------------- Derived Data -----------------------------
  const pageCount = Math.ceil(filteredApplications.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredApplications.slice(offset, offset + itemsPerPage);

  // ----------------------------- Render -----------------------------
  return (
    <div className="container mx-auto p-4">
      <div className="text-4xl font-bold mb-8 text-left text-black">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8 text-left text-black">Activity</h1>

        {/* Statistics */}
        <WhiteBox>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-100 p-6 shadow rounded flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-center">Applications Sent</h3>
              <p className="text-lg text-center">{applicationsSent}</p>
            </div>
            <div className="bg-red-100 p-6 shadow rounded flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-center">Rejections</h3>
              <p className="text-lg text-center">{rejections}</p>
            </div>
            <div className="bg-green-100 p-6 shadow rounded flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-center">Acceptances</h3>
              <p className="text-lg text-center">{acceptances}</p>
            </div>
          </div>
        </WhiteBox>

        {/* Applications List */}
        <WhiteBox className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <FaFolderOpen className="mr-2" /> My Applications
            </h2>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
              {/* Filters Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center px-3 py-2 bg-blue-500 text-white text-sm rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                <FaFilter className="mr-2" />
                Filters
              </button>

              {/* Search Bar */}
              <SearchBar
                placeholder="Search applications..."
                width="100%" // Full width on smaller screens
                onSearch={handleSearch}
              />
            </div>
          </div>
          <ApplicationCards
            applications={currentItems.map((app) => ({
              ...app,
              onClick:
                app.status === "Applying"
                  ? () => navigate(`/apply/${app.job._id}`)
                  : null,
            }))}
          />
          <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
        </WhiteBox>
        <ActivityFilter
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          applyFilters={(filters) => console.log("Applied Filters:", filters)}
        />
      </div>
    </div>
  );
};

export default ApplicantActivity;
