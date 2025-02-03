import React, { useEffect, useState } from "react";
import { getAllJobs, applyToJob } from "../../services/applicationService";
import ComboBox from "../../components/ComboBox";
import Dropdown from "../../components/Dropdown";

function UserJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [viewMode, setViewMode] = useState("grid"); //// TRYING OUT GRID AND LIST FORMATS
    const userId = "user1"; ///replace with acc user HERE!!!

    useEffect(() => {
        async function fetchJobs() {
            const data = await getAllJobs();
            setJobs(data);
        }
        fetchJobs();
    }, []);

    const handleApply = async (jobId) => {
        const coverLetter = "HELLO I AM THE COVER LETTER COVER LETTER COVER LETTER"; /// add cover letter here
        try {
            const newApp = await applyToJob({ jobId, userId, coverLetter });
            console.log("Application successful!", newApp);
            alert("Applied successfully!");
        } 
        catch (err) {
            console.error(err);
            alert("Failed to apply.");
        }
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
      };
return (
    <div className="bg-slate-900 min-h-screen w-full flex flex-col items-center">
      {/* PAGE HEADER */}
      <div className="text-center mt-10 mb-4">
        <h1 className="text-white text-4xl font-bold">Available Job Posts</h1>
        <p className="text-stone-200 text-lg mt-2"> Find the perfect opportunity for you </p>
      </div>

      {/* FILTER ROW ---> CHANGE OPTIONS AND TYPES WITH UPDATED ONES*/}
      <div className="flex items-stretch pt-4 pb-4 gap-4 justify-center">
        <Dropdown label="Job Type (NON FUNCTIONAL!!!!)" options={["Graduate","Full-Time","Part-Time","Internship", "Apprenticeship", "Placement",]}/>
        <ComboBox label="Role (NON FUNCTIONAL!!!!)" options={["Software Engineer","Frontend Developer","Backend Developer","Fullstack Developer",]}/>
        <ComboBox label="Region (NON FUNCTIONAL!!!!)"  options={["England", "Scotland", "Wales", "Northern Ireland"]} />
      </div>

      {/* TOGGLE BUTTONS FOR GRID OR LIST */}
      <div className="flex mb-4 gap-4">
        <button onClick={() => handleViewModeChange("grid")} className={`px-4 py-2 rounded-md border   ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-800"} transition duration-300 `}> Grid View </button>
        <button onClick={() => handleViewModeChange("list")} className={`px-4 py-2 rounded-md border ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-800"} transition duration-300 `}> List View </button>
      </div>

      {/* JOB CONTAINER */}
      <div
        className={
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-10" : "flex flex-col space-y-4 px-4 pb-10"
        }
      >
        {jobs.map((job) => (
          <div key={job._id} className="bg-white p-4 rounded-md shadow-md flex flex-col justify-between" style={{ width: viewMode === "grid" ? "100%" : "auto" }} >
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800"> {job.title}  </h2>
              <p className="text-gray-600 mb-1">{job.description}</p>
              <p className="text-gray-600 mb-1"> Location: <span className="font-medium">{job.location}</span> </p>
              {job.requirements?.length > 0 && (
                <p className="text-gray-600 mb-1"> Requirements: <span className="font-medium">{job.requirements.join(", ")}</span> </p>
              )}
            </div>
            <div className="mt-4">
              <button onClick={() => handleApply(job._id)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"> Apply </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserJobsPage;
