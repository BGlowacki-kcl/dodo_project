import React, { useEffect, useState } from "react";
import { getAllUserApplications } from "../../services/applicationService"; //// any functions using applicationservice are filled with fake details for now!!!

function UserApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const userId = "user1"; ////// REPLACEHERERERE

    useEffect(() => {
        async function fetchApplications() {
            const data = await getAllUserApplications(userId);
            setApplications(data);
        }
        fetchApplications();
    }, [userId]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">My Applications</h1>
            {applications.length === 0 ? ( <p>You have not applied to any jobs yet.</p>) : (
            <ul className="space-y-4">
            {applications.map((app) => (
                <li key={app._id} className="border p-4 rounded-md">
                <p className="font-semibold"> Job Title: {app.job?.title} </p>
                <p>Status: {app.status}</p>
                <p>Submitted: {new Date(app.submittedAt).toLocaleString()}</p>
                {/*LINK TO APPLICATION PAGE HERE */}
                <a href={`/user/applications/${app._id}`} className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"> View Details </a>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}

export default UserApplicationsPage;
