/**
 * Activity.jsx
 *
 * This component displays the user's activity, including:
 * - Statistics for applications sent, rejections, and acceptances.
 * - A list of the user's applications with the ability to continue ongoing applications.
 */

import React, { useEffect, useState } from "react";
import { getAllUserApplications } from "../services/applicationService";
import ApplicationCards from "./ApplicationCards";
import { FaFolderOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import WhiteBox from "./WhiteBox";

const ApplicantActivity = ({ userId }) => {
  // ----------------------------- State Variables -----------------------------
  const [applications, setApplications] = useState([]);
  const [applicationsSent, setApplicationsSent] = useState(0);
  const [rejections, setRejections] = useState(0);
  const [acceptances, setAcceptances] = useState(0);
  const navigate = useNavigate();

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches all user applications and updates the statistics.
   */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applications = await getAllUserApplications(userId);
        setApplications(applications);
        setApplicationsSent(applications.length);
        setRejections(
          applications.filter((app) => app.status === "Rejected").length
        );
        setAcceptances(
          applications.filter((app) => app.status === "Accepted").length
        );
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, [userId]);

  // ----------------------------- Render -----------------------------
  return (
    <div className="container mx-auto p-4">
      <div className="text-4xl font-bold mb-8 text-left text-black">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8 text-left text-black">
          Activity
        </h1>

        {/* Statistics */}
        <WhiteBox>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-100 p-6 shadow rounded flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-center">Applications Sent</h3>
              <p className="text-lg text-center">{applicationsSent}</p>
            </div>
            <div className="bg-red-100 p-6 shadow rounded flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-center">Rejections</h3>
              <p className="text-lg text-center">{rejections}</p>
            </div>
            <div className="bg-green-100 p-6 shadow rounded flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-center">Acceptances</h3>
              <p className="text-lg text-center">{acceptances}</p>
            </div>
          </div>
        </WhiteBox>

        {/* Applications List */}
        <WhiteBox className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaFolderOpen className="mr-2" /> My Applications
          </h2>
          <ApplicationCards
            applications={applications.map((app) => ({
              ...app,
              onClick:
                app.status === "Applying"
                  ? () => navigate(`/apply/${app.job._id}`)
                  : null,
            }))}
          />
        </WhiteBox>
      </div>
    </div>
  );
};

export default ApplicantActivity;