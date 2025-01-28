import React, { useState } from "react";
import SearchBar from "../components/SearchBar";

function EmployerPosts() {
    const jobs = [
        { id: 1, title: "Software Engineer", location: "San Francisco", type: "Full-time", applicants: 10 },
        { id: 2, title: "Data Analyst",  location: "Remote", type: "Part-time", applicants: 5 },
        { id: 3, title: "Frontend Developer",  location: "New York", type: "Full-time", applicants: 7 },
        { id: 4, title: "Backend Developer", location: "Remote", type: "Contract", applicants: 3 },
    ];

    const [filters, setFilters] = useState({
        location: "",
        jobType: "",
        applicants: 0,
    });

    const [searchTerm, setSearchTerm] = useState("");

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const applyFilters = (job) => {
        const matchesLocation = filters.location === "" || job.location.toLowerCase().includes(filters.location.toLowerCase());
        const matchesJobType = filters.jobType === "" || job.type === filters.jobType;
        const matchesSearchTerm = searchTerm === "" || job.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesLocation && matchesJobType && matchesSearchTerm;
    };

    const filteredJobs = jobs.filter(applyFilters);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <div className="w-64 bg-white shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        placeholder="Enter location"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Job Type</label>
                    <select
                        name="jobType"
                        value={filters.jobType}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Your Job Posts</h2>
                    <SearchBar placeholder="Search jobs..." onSearch={handleSearch} />
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        +
                    </button>
                </div>
                
                <div className="space-y-4">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-medium">{job.title}</h3>
                            <p className="text-gray-600">{job.location}</p>
                            <p className="text-sm text-gray-500">{job.type}</p>
                            <p className="text-sm text-gray-500">Applicants: {job.applicants}</p>
                            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                View
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default EmployerPosts;
