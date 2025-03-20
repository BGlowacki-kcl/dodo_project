import { useState, useEffect } from "react";
import EmployerSideBar from '../../components/EmployerSideBar';
import { getTotalApplicantsByEmployer } from '../../services/applicationService';

const EmployerDashboard = () => {
    const [totalApplicants, setTotalApplicants] = useState(0);

    useEffect(() => {
        const fetchTotalApplicants = async () => {
            try {
                const total = await getTotalApplicantsByEmployer();
                setTotalApplicants(total);
                console.log("Total applicants:", total);
            } catch (error) {
                console.error("Error fetching total applicants:", error);
            }
        };

        fetchTotalApplicants();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray">
            
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold">Employer Dashboard</h1>
                <p className="mt-4 text-lg">Total Applicants: {totalApplicants}</p>
            </div>
        </div>
    );
};

export default EmployerDashboard;