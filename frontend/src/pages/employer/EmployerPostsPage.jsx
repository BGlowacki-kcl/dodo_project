import React, { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import { getAllJobs } from "../../services/jobService";

function EmployerPosts() {
    const [jobs, setJobs] = useState([]);
    const [filters, setFilters] = useState({
        location: "",
        jobType: "",
        applicants: 0,
    });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch('/api/job')
            .then(response => response.json())
            .then(data => setJobs(data))
            .catch(error => console.error('Error fetching jobs:', error));
    }, []);

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

    if (loading) {
        return <div className="p-4">Loading jobs...</div>;
      }
    return (
        <div className="min-h-screen bg-[#0C1821] text-white flex flex-col">
            <div className="flex flex-1">
                <div className="w-64 bg-[#1B2A41] shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-white">Filters</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-white">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={filters.location}
                            onChange={handleFilterChange}
                            placeholder="Enter location"
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 bg-white rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-white text-black"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-white">Job Type</label>
                        <select
                            name="jobType"
                            value={filters.jobType}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-500 bg-white rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-white text-black"
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
                        <h2 className="text-2xl font-semibold text-white">Your Job Posts</h2>
                        <SearchBar placeholder="Search jobs..." onSearch={handleSearch} />
                        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            +
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {filteredJobs.map((job) => (
                            <div key={job._id} className="bg-[#1B2A41] p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-medium text-white">{job.title}</h3>
                                <p className="text-white">{job.location}</p>
                                <p className="text-sm text-white">{job.type}</p>
                                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployerPosts;

