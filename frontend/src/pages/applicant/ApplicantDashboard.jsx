import React, { useState } from "react";

function ApplicantDashboard() {
    // Sample job data, just for demo purpose
    const jobs = [
        { id: 1, title: "Software Engineer", company: "Tech Corp", location: "San Francisco", type: "Full-time" },
        { id: 2, title: "Data Analyst", company: "Data Inc", location: "Remote", type: "Part-time" },
        { id: 3, title: "Frontend Developer", company: "Web Solutions", location: "New York", type: "Full-time" },
        { id: 4, title: "Backend Developer", company: "Code Masters", location: "Remote", type: "Contract" },
    ];

    const [filters, setFilters] = useState({
        location: "",
        jobType: "",
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value,
        });
    };

    const filteredJobs = jobs.filter((job) => {
        return (
            (filters.location === "" || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
            (filters.jobType === "" || job.type === filters.jobType)
        );
    });

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

            {/* Job list */}
            <div className="flex-1 p-6">
                <h2 className="text-2xl font-semibold mb-6">Job listing</h2>

                <div className="space-y-4">
                    {filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                            {/* Placeholder for job model */}
                            <h3 className="text-xl font-medium">{job.title}</h3>
                            <p className="text-gray-600">{job.company} - {job.location}</p>
                            <p className="text-sm text-gray-500">{job.type}</p>
                            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Apply
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ApplicantDashboard;