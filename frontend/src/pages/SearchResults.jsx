import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SearchResults = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const jobType = searchParams.get("jobType") || "";
    const role = searchParams.get("role") || "";
    const region = searchParams.get("region") || "";

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const queryParams = new URLSearchParams({ jobType, role, region }).toString();
                const response = await fetch(`http://localhost:5000/api/jobs/search?${queryParams}`);

                if (!response.ok) throw new Error("Failed to fetch search results");

                const data = await response.json();
                setSearchResults(data.jobs);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [jobType, role, region]);

    return (
        <div className="bg-background">
            <div className="bg-primary"> 
                <p className="text-heading font-heading text-left px-48">Search Results</p>
            </div>
            <div className="bg-secondary text-ltext h-10 items-center py-2"> 
                <p className="text-medium text-left px-48">Showing results for <strong>{jobType}</strong> <strong>{role}</strong> in <strong>{region}</strong></p>
            </div>
            <div className="pt-10 bg-cover bg-center h-screen w-full grid grid-cols-10 bg-[#1b2a41]">
                <div className="col-start-3 col-span-6">
                    {loading ? (
                        <p className="text-white text-center">Loading search results...</p>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((job, index) => (
                            <div key={index} className="bg-primary rounded-lg shadow-lg text-ltext p-4 mb-4">
                                <div className="flex items-center gap-4">
                                    {job.companyLogo && (
                                        <img src={job.companyLogo} alt={job.companyName} className="w-12 h-12 rounded-full" />
                                    )}
                                    <div>
                                        <h2 className="text-lg font-bold">{job.title}</h2>
                                        <p className="text-sm">{job.companyName}</p>
                                        <p className="text-sm">Type: {job.jobType}</p>
                                        <p className="text-sm">Location: {job.location}</p>
                                        <p className="text-sm">Salary: {job.salary || "Not specified"}</p>
                                    </div>
                                </div>
                                <p className="text-sm mt-2">{job.description}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-white text-center">No job results found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
