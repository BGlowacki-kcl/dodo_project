import React, { useState } from 'react';
import JobList from '../../components/JobList.jsx';
import Metrics from '../../components/Metrics.jsx';
import Statistics from '../../components/Statistics.jsx';

const Dashboard = () => {
    const [selectedJob, setSelectedJob] = useState('Job Post 1');

    const jobs = ['Job Post 1', 'Job Post 2', 'Job Post 3'];

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6">Employer Dashboard</h1>

            <div className="grid grid-cols-3 gap-6">
                {/* Job List (Sidebar) */}
                <JobList jobs={jobs} onSelectJob={setSelectedJob} />

                {/* Metrics and Chart */}
                <div className="col-span-2 space-y-6">
                    <Metrics selectedJob={selectedJob} />
                    {/*<Statistics selectedJob={selectedJob} />*/}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
