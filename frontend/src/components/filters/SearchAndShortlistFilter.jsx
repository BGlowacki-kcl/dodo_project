/**
 * SearchAndShortlistFilter.jsx
 *
 * This component provides advanced filtering options for job searches.
 * - Allows filtering by titles, locations, job types, companies, salary range, and deadlines.
 * - Uses local storage to persist selected filters.
 * - Fetches filter data dynamically from the backend.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getAllJobRoles,
  getAllJobLocations,
  getAllJobTypes,
  getAllCompanies,
  getSalaryBounds,
} from "../../services/job.service";
import useLocalStorage from "../../hooks/useLocalStorage";
import {
  FaFilter,
  FaBuilding,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaBriefcase,
  FaClipboardList,
} from "react-icons/fa";

const SearchAndShortlistFilter = ({ isOpen, onClose, applyFilters }) => {
  // ----------------------------- Hooks and State -----------------------------
  const url = useLocation();
  const searchParams = new URLSearchParams(url.search);

  // Use local storage for selected filters
  const [selectedTitles, setSelectedTitles] = useLocalStorage("selectedTitles", searchParams.getAll("titles") || []);
  const [selectedLocations, setSelectedLocations] = useLocalStorage("selectedLocations", searchParams.getAll("locations") || []);
  const [selectedJobTypes, setSelectedJobTypes] = useLocalStorage("selectedJobTypes", searchParams.getAll("jobTypes") || []);
  const [selectedCompanies, setSelectedCompanies] = useLocalStorage("selectedCompanies", searchParams.getAll("companies") || []);
  const [salaryRange, setSalaryRange] = useLocalStorage("salaryRange", [0, 100000]); // Default range
  const [deadlineRange, setDeadlineRange] = useLocalStorage("deadlineRange", 7); // Default: 7 days

  const [titles, setTitles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [salaryBounds, setSalaryBounds] = useState({ min: 0, max: 100000 });

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches filter data (titles, locations, job types, companies, salary bounds).
   */
  const fetchFilterData = async () => {
    try {
      const fetchedTitles = await getAllJobRoles();
      const fetchedLocations = await getAllJobLocations();
      const fetchedJobTypes = await getAllJobTypes();
      const fetchedCompanies = await getAllCompanies();
      const { minSalary, maxSalary } = await getSalaryBounds();

      setTitles(fetchedTitles);
      setLocations(fetchedLocations);
      setJobTypes(fetchedJobTypes);
      setCompanies(fetchedCompanies);
      setSalaryBounds({ min: minSalary, max: maxSalary });
      setSalaryRange([minSalary, maxSalary]);
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  // ----------------------------- Effects -----------------------------
  /**
   * Effect to fetch filter data when the component mounts.
   */
  useEffect(() => {
    fetchFilterData();
  }, []);

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles applying the selected filters.
   */
  const handleApplyFilters = () => {
    const filters = {
      titles: selectedTitles,
      locations: selectedLocations,
      jobTypes: selectedJobTypes,
      companies: selectedCompanies,
      salaryRange,
      deadlineRange,
    };
    console.log("Selected Filters:", filters);
    applyFilters(filters); // Pass filters to parent component
    onClose(); // Close the filter pop-up
  };

  /**
   * Toggles the selection of a filter option.
   * @param {string} value - The value to toggle.
   * @param {Array} selectedList - The current list of selected values.
   * @param {Function} setSelectedList - The setter function for the selected list.
   */
  const toggleSelection = (value, selectedList, setSelectedList) => {
    if (selectedList.includes(value)) {
      setSelectedList(selectedList.filter((item) => item !== value));
    } else {
      setSelectedList([...selectedList, value]);
    }
  };

  // ----------------------------- Render -----------------------------
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-w-[90%] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaFilter className="text-blue-500" /> Advanced Filters
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
          {/* Grid Layout for Compact Design */}
          <div className="grid grid-cols-2 gap-4">
            {/* Titles */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaClipboardList className="text-blue-500" /> Titles
              </h3>
              <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                {titles.map((title) => (
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

            {/* Companies */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaBuilding className="text-blue-500" /> Companies
              </h3>
              <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                {companies.map((company) => (
                  <label key={company} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company)}
                      onChange={() => toggleSelection(company, selectedCompanies, setSelectedCompanies)}
                    />
                    {company}
                  </label>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" /> Locations
              </h3>
              <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                {locations.map((location) => (
                  <label key={location} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location)}
                      onChange={() => toggleSelection(location, selectedLocations, setSelectedLocations)}
                    />
                    {location}
                  </label>
                ))}
              </div>
            </div>

            {/* Job Types */}
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FaBriefcase className="text-blue-500" /> Job Types
              </h3>
              <div className="border rounded p-2 max-h-32 overflow-y-auto text-xs">
                {jobTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedJobTypes.includes(type)}
                      onChange={() => toggleSelection(type, selectedJobTypes, setSelectedJobTypes)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <FaDollarSign className="text-blue-500" /> Salary Range
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={salaryBounds.min}
                max={salaryBounds.max}
                step="1000"
                value={salaryRange[1]}
                onChange={(e) => setSalaryRange([salaryRange[0], Number(e.target.value)])}
                className="w-full"
              />
              <span className="text-xs">{`$${salaryRange[0]} - $${salaryRange[1]}`}</span>
            </div>
          </div>

          {/* Deadlines */}
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <FaClock className="text-blue-500" /> Deadlines
            </h3>
            <input
              type="number"
              value={deadlineRange}
              onChange={(e) => setDeadlineRange(Number(e.target.value))}
              placeholder="Days until deadline"
              className="w-full border rounded p-2 text-xs"
            />
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

export default SearchAndShortlistFilter;