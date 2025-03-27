/**
 * ActivityFilter.jsx
 *
 * This component provides filtering options for user activities.
 * - Allows filtering by titles, types, statuses, and submission dates.
 */

import React, { useState, useEffect } from "react";
import { FaFilter, FaClipboardList, FaBriefcase, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

const ActivityFilter = ({ isOpen, onClose, applyFilters }) => {
  // ----------------------------- State -----------------------------
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(""); // Predefined date range

  const [titles, setTitles] = useState([]);
  const [types, setTypes] = useState([]);
  const [statuses] = useState([
    "Applying",
    "Applied",
    "In Review",
    "Shortlisted",
    "Code Challenge",
    "Rejected",
    "Accepted",
  ]); // Updated to include all statuses

  const [titleSearch, setTitleSearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");

  // ----------------------------- Effects -----------------------------
  useEffect(() => {
    // Simulate fetching filter data (titles, types)
    setTitles(["Software Engineer", "Data Scientist", "Product Manager"]);
    setTypes(["Full-Time", "Part-Time", "Internship"]);
  }, []);

  // ----------------------------- Handlers -----------------------------
  const toggleSelection = (value, selectedList, setSelectedList) => {
    if (selectedList.includes(value)) {
      setSelectedList(selectedList.filter((item) => item !== value));
    } else {
      setSelectedList([...selectedList, value]);
    }
  };

  const handleApplyFilters = () => {
    const filters = {
      titles: selectedTitles,
      types: selectedTypes,
      statuses: selectedStatuses,
      submissionDateRange: selectedDateRange, // Use predefined date range
    };
    applyFilters(filters);
    onClose();
  };

  // ----------------------------- Render -----------------------------
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-w-[90%] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaFilter className="text-blue-500" /> Activity Filters
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Filter Content */}
        <div className="space-y-4 text-sm text-gray-700">
          <div className="grid grid-cols-2 gap-4">
            {/* Titles */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaClipboardList className="text-blue-500" /> Titles
              </h3>
              <input
                type="text"
                placeholder="Search titles..."
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className="w-full border rounded p-2 text-xs mb-2"
              />
              <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                {titles
                  .filter((title) => title.toLowerCase().includes(titleSearch.toLowerCase()))
                  .map((title) => (
                    <label key={title} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTitles.includes(title)}
                        onChange={() => toggleSelection(title, selectedTitles, setSelectedTitles)}
                      />
                      {title}
                    </label>
                  ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaBriefcase className="text-blue-500" /> Types
              </h3>
              <input
                type="text"
                placeholder="Search types..."
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                className="w-full border rounded p-2 text-xs mb-2"
              />
              <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                {types
                  .filter((type) => type.toLowerCase().includes(typeSearch.toLowerCase()))
                  .map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleSelection(type, selectedTypes, setSelectedTypes)}
                      />
                      {type}
                    </label>
                  ))}
              </div>
            </div>

            {/* Submission Date */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" /> Submission Date
              </h3>
              <div className="border rounded p-2 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dateRange"
                    value="1_week"
                    checked={selectedDateRange === "1_week"}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  />
                  1 Week Ago
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dateRange"
                    value="2_weeks"
                    checked={selectedDateRange === "2_weeks"}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  />
                  2 Weeks Ago
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dateRange"
                    value="1_month"
                    checked={selectedDateRange === "1_month"}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  />
                  1 Month Ago
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dateRange"
                    value="past_1_month"
                    checked={selectedDateRange === "past_1_month"}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  />
                  Past One Month Ago
                </label>
              </div>
            </div>

            {/* Statuses */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaCheckCircle className="text-blue-500" /> Statuses
              </h3>
              <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                {statuses.map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleSelection(status, selectedStatuses, setSelectedStatuses)}
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded text-xs hover:bg-gray-400 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded text-xs hover:bg-blue-600 transition"
            onClick={handleApplyFilters}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilter;