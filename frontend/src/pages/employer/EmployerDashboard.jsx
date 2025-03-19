import { useState, useEffect } from "react";
import EmployerSideBar from '../../components/EmployerSideBar';

const EmployerDashboard = () => {
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplicants: 0,
        positionsFilled: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = sessionStorage.getItem('token');
                
                // Fetch employer's jobs
                const jobsResponse = await fetch("/api/job/employer", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!jobsResponse.ok) {
                    throw new Error('Failed to fetch jobs');
                }

                const jobs = await jobsResponse.json();

                // Fetch applicants count for each job
                let totalApplicants = 0;
                for (const job of jobs) {
                    const applicantsResponse = await fetch(`/api/application/job/${job._id}/applicants`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (applicantsResponse.ok) {
                        const data = await applicantsResponse.json();
                        totalApplicants += data.data.length;
                    }
                }

                setStats({
                    totalJobs: jobs.length,
                    totalApplicants: totalApplicants,
                    
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setError('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployerSideBar />
            
            <div className="ml-64 p-8 flex-1">
                <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[80vh] relative">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-2">Total Jobs Posted</h3>
                            {loading ? (
                                <p className="text-3xl font-bold text-blue-600">...</p>
                            ) : (
                                <p className="text-3xl font-bold text-blue-600">{stats.totalJobs}</p>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-2">Total Applicants</h3>
                            {loading ? (
                                <p className="text-3xl font-bold text-green-600">...</p>
                            ) : (
                                <p className="text-3xl font-bold text-green-600">{stats.totalApplicants}</p>
                            )}
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerDashboard;


