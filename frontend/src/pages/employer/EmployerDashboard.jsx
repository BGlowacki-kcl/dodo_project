import React, { useState, useEffect } from 'react';
import JobList from '../../components/JobList.jsx';
import Metrics from '../../components/Metrics.jsx';
import Statistics from '../../components/Statistics.jsx';
import { getAllJobs } from '../../services/jobService';

const Dashboard = () => {
    const [selectedJob, setSelectedJob] = useState('');
    const [jobs, setJobs] = useState([]);

    const employerId = "67aa6f2ce7d1ee03803ef428"; /// TEMPORARY WILL GET FROM AUTH CONTEXT

    useEffect(() => {
        async function fetchJobs() {
          try {
            const data = await getAllJobs(employerId); 
            const jobTitles = data.map((job) => job.title);
            setJobs(jobTitles);
            setSelectedJob(jobTitles[0] || '');
          } catch (error) {
            console.error('Error fetching jobs:', error);
          }
        }
        fetchJobs();
      }, [employerId]);

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
