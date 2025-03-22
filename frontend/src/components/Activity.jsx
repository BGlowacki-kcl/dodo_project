import React, { useEffect, useState } from 'react';
import { getAllUserApplications } from '../services/applicationService';
import ApplicationCards from './ApplicationCards';
import { FaFolderOpen } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';

const ApplicantActivity = ({ userId }) => {
    const [applications, setApplications] = useState([]);
    const [applicationsSent, setApplicationsSent] = useState(0);
    const [rejections, setRejections] = useState(0);
    const [acceptances, setAcceptances] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchApplications() {
            try {
                const applications = await getAllUserApplications(userId);
                setApplications(applications);
                setApplicationsSent(applications.length);
                setRejections(applications.filter(app => app.status === 'rejected').length);
                setAcceptances(applications.filter(app => app.status === 'accepted').length);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        }

        fetchApplications();
    }, [userId]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-left text-black">
                Activity
            </h1>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-100 p-6 shadow rounded">
                        <h3 className="text-lg font-bold">Applications Sent</h3>
                        <p className="text-xl">{applicationsSent}</p>
                    </div>
                    <div className="bg-red-100 p-6 shadow rounded">
                        <h3 className="text-lg font-bold">Rejections</h3>
                        <p className="text-xl">{rejections}</p>
                    </div>
                    <div className="bg-green-100 p-6 shadow rounded">
                        <h3 className="text-lg font-bold">Acceptances</h3>
                        <p className="text-xl">{acceptances}</p>
                    </div>
                </div>
            </div>
        
            <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <FaFolderOpen className="mr-2" /> My Applications
                </h2>
                <ApplicationCards
                    applications={applications.map((app) => ({
                        ...app,
                        onClick: app.status === "applying" ? () => navigate(`/apply/${app.job._id}`) : null,
                    }))}
                />
            </div>
        </div>
    );
};

export default ApplicantActivity;