import React, { useState } from "react";

function ApplicantShortlist() {
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
        <div className="min-h-screen bg-black text-white flex">
            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="w-72 bg-gray-900 p-6 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-white">Filters</h2>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={filters.location}
                            onChange={handleFilterChange}
                            placeholder="Enter location"
                            className="mt-2 block w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring focus:ring-white"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold">Job Type</label>
                        <select
                            name="jobType"
                            value={filters.jobType}
                            onChange={handleFilterChange}
                            className="mt-2 block w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring focus:ring-white"
                        >
                            <option value="">All</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                        </select>
                    </div>
                </div>

                {/* Job listing */}
                <div className="flex-1 p-10 bg-gray-800">
                    <h2 className="text-3xl font-bold mb-8 text-white">Job Listings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="bg-gray-700 p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl border border-gray-600">
                                <h3 className="text-2xl font-semibold text-white">{job.title}</h3>
                                <p className="text-gray-300 mt-2">{job.company} - {job.location}</p>
                                <p className="text-gray-300 mt-2">{job.type}</p>  {/* Updated: No bubble, just plain text */}
                                <button className="mt-5 w-full bg-white text-black py-2 rounded-lg transition-all hover:bg-gray-300 shadow-md">
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicantShortlist;