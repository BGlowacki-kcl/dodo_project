import { useState, useEffect } from "react";
import JobList from "../../components/JobList.jsx";
import Metrics from "../../components/Metrics.jsx";
import Statistics from "../../components/Statistics.jsx";
import { getAllJobs } from "../../services/jobService";

const EmployerDashboard = () => {
    const [activeView, setActiveView] = useState("metrics");
    const [selectedJob, setSelectedJob] = useState("");
    const [jobs, setJobs] = useState([]);
    const employerId = "67aa6f2ce7d1ee03803ef428"; // TEMPORARY: Replace with Auth Context

    useEffect(() => {
        async function fetchJobs() {
            try {
                const data = await getAllJobs(employerId);
                const jobTitles = data.map((job) => job.title);
                setJobs(jobTitles);
                setSelectedJob(jobTitles[0] || "");
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        }
        fetchJobs();
    }, [employerId]);

    return (
        <div className="min-h-screen bg-[#0C1821] flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#1B2A41] shadow-lg p-4 border-r border-[#324A5F] flex flex-col h-screen">
                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveView("metrics")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            activeView === "metrics"
                                ? "bg-[#324A5F] text-white font-medium"
                                : "hover:bg-[#324A5F]/30 text-gray-200"
                        }`}
                    >
                        Metrics
                    </button>
                    <button
                        onClick={() => setActiveView("statistics")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            activeView === "statistics"
                                ? "bg-[#324A5F] text-white font-medium"
                                : "hover:bg-[#324A5F]/30 text-gray-200"
                        }`}
                    >
                        Statistics
                    </button>
                    <button
                        onClick={() => setActiveView("jobs")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            activeView === "jobs"
                                ? "bg-[#324A5F] text-white font-medium"
                                : "hover:bg-[#324A5F]/30 text-gray-200"
                        }`}
                    >
                        Job Listings
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 max-w-7xl mx-auto bg-[#0C1821]">
                {activeView === "metrics" && <Metrics selectedJob={selectedJob} />}
                {activeView === "statistics" && <Statistics selectedJob={selectedJob} />}
                {activeView === "jobs" && <JobList jobs={jobs} onSelectJob={setSelectedJob} />}
            </div>
        </div>
    );
};

export default EmployerDashboard;
