import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // <-- import Link
import { getAllUserApplications } from "../../services/applicationService";

function UserApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
    const [statusFilter, setStatusFilter] = useState("all"); //// update when backend

    useEffect(() => {
      async function fetchApps() {
        try {
          const data = await getAllUserApplications();
          setApplications(data);
        } 
        catch (err) {
          console.error("Error fetching applications:", err);
        }
      }
      fetchApps();
    }, []);

    const filteredApplications = applications.filter((app) => {
        if (statusFilter === "all") return true;
        return app.status === statusFilter;
    });

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
      };
    
      const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
      };
    return (
    <div className="bg-slate-900 min-h-screen w-full flex flex-col items-center">
      {/* PAGE HEADER */}
      <div className="text-center mt-10 mb-6">
        <h1 className="text-white text-4xl font-bold">My Applications</h1>
        <p className="text-stone-200 text-lg mt-2"> Track your job applications </p>
      </div>

      {/* BUTTON THAT TAKES YOU TO A PAGE CALLED THE USER JOBS PAGE*/}
      <Link
        to="/user/jobs"
        className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Browse Jobs
      </Link>

      {/* FILTER ROW*/}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        {/* Status Filter */}
        <div>
            <label htmlFor="statusFilterSelect" className="text-white block mb-1">Filter by Status</label>
            <select id="statusFilterSelect" value={statusFilter} onChange={handleStatusChange} className="px-2 py-1 rounded-md border bg-white text-gray-800"  >
                <option value="all">All</option>
                <option value="applied">Applied</option>
                <option value="in review">In Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
          </select>
        </div>

        {/* TOGGLE BUTTONS FOR GRID OR LIST */}
        <div className="flex gap-3">
            <button onClick={() => handleViewModeChange("list")} className={`px-4 py-2 rounded-md border  ${ viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-800" } transition duration-300`} > List View </button>
            <button onClick={() => handleViewModeChange("grid")} className={`px-4 py-2 rounded-md border  ${ viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-800" } transition duration-300`} > Grid View </button>
        </div>
      </div>

      {/* APPLICATION CONTAINTER */}
      {filteredApplications.length === 0 ? (
        <p className="text-white mt-6"> You have not applied to any jobs yet, or none match your filter. </p>
      ) : (
        <div
          className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-10" : "flex flex-col space-y-4 px-4 pb-10 max-w-5xl w-full"} >
          {filteredApplications.map((app) => (
            <div key={app._id} className="bg-white p-4 rounded-md shadow-md flex flex-col justify-between" >
              <div>
                <p className="text-xl font-semibold text-gray-800 mb-2"> {app.job?.title} </p>
                <p className="text-gray-600 mb-1"> Status: <span className="font-medium">{app.status}</span> </p>
                <p className="text-gray-600 mb-1"> Submitted:{" "} {new Date(app.submittedAt).toLocaleString("en-GB")} </p>
              </div>
              <div className="mt-4">
                <a href={`/user/applications/${app._id}`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300" > View Details </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default UserApplicationsPage;
