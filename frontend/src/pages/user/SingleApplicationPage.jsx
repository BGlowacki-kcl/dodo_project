
import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {getApplicationById,withdrawApplication,} from "../../services/applicationService";

function SingleApplicationPage() {
    const { appId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);

    useEffect(() => {
        async function fetchApp() {
            const data = await getApplicationById(appId);
            setApplication(data);
        }
        fetchApp();
    }, [appId]);

    const handleWithdraw = async () => {
        if (!window.confirm("Are you sure you want to withdraw this application?")) {
            return;
        }
        try {
            await withdrawApplication(appId);
            alert("Application withdrawn successfully!");
            navigate("/user/applications");
        } 
        catch (err) {
            console.error(err);
            alert("Failed to withdraw application.");
        }
    };

    if (!application) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Application Details</h1>
            <p><strong>Job Title:</strong> {application.job?.title}</p>
            <p><strong>Status:</strong> {application.status}</p>
            <p><strong>Cover Letter:</strong> {application.coverLetter}</p>
            <p><strong>Submitted At:</strong> {new Date(application.submittedAt).toLocaleString()}</p>

        <button onClick={handleWithdraw} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"> Withdraw Application </button>
        </div>
    );
}

export default SingleApplicationPage;
