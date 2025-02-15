import React, { useState, useEffect } from 'react';
import Metrics from '../../components/Metrics.jsx';

const Dashboard = () => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetch('/api/job')
            .then(response => response.json())
            .then(data => {
                setJobs(data);
                if (data.length > 0) {
                    setSelectedJob(data[0]);
                }
            })
            .catch(error => console.error('Error fetching jobs:', error));
    }, []);

    return (
        <div className="min-h-screen bg-[#CCC9DC] p-8">
            <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">
                Employer Dashboard
            </h1>

            <div className="grid grid-cols-3 gap-6">
                {/* Job List - Sidebar with Cards */}
                <div className="bg-[#CCC9DC] text-white p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Job Listings</h2>
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className={`p-4 rounded-lg cursor-pointer shadow-md transition transform ${
                                    selectedJob?.id === job.id 
                                        ? 'border-2 border-[#8D86C9] scale-105' 
                                        : 'bg-white text-[#1B2A41]'
                                }`}
                            >
                                <h3 className="text-lg font-semibold">{job.title}</h3>
                                <p className="text-sm text-gray-600">{job.company}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Section - Metrics */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <Metrics selectedJob={selectedJob} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


