import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applyToJob } from "../../services/applicationService";
import { getAllJobs } from "../../services/jobService";
import ComboBox from "../../components/ComboBox";
import Dropdown from "../../components/Dropdown";
import SwipeFilters from "../../components/SwipeFilters"; 
import { addJobToShortlist, getShortlist } from "../../services/shortlist.service";
import { getAllUserApplications } from "../../services/applicationService";
import { userService } from "../../services/user.service"; 

function UserJobsPage() {
    const [allJobs, setAllJobs] = useState([]);  // store all fetched jobs
    const [jobs, setJobs] = useState([]);        // store filtered (displayed) jobs
    const [userId, setUserId] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [applyOpenId, setApplyOpenId] = useState(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [successMessages, setSuccessMessages] = useState({});
    const [appliedSet, setAppliedSet] = useState(new Set());       
    const [shortlistedSet, setShortlistedSet] = useState(new Set());


    useEffect(() => {
      async function fetchJobs() {
        try {
          const userProfileResponse = await userService.getUserProfile();
          if (userProfileResponse.success) {
            setUserId(userProfileResponse.data._id);
            const userApps = await getAllUserApplications();
            const alreadyAppliedJobIds = userApps.map((app) => app.job?._id);
            setAppliedSet(new Set(alreadyAppliedJobIds));

            const shortlist = await getShortlist(userProfileResponse.data._id);
            if (shortlist && shortlist.jobs) {
              const alreadyShortlistedIds = shortlist.jobs.map((job) => job._id);
              setShortlistedSet(new Set(alreadyShortlistedIds));
            }
          }
          const data = await getAllJobs();
          setAllJobs(data);
          setJobs(data);
        } catch (err) {
          console.error("Error fetching jobs:", err);
        }
      }
      fetchJobs();
    }, []);
    
    const handleOpenApply = (jobId) => {
      if (applyOpenId === jobId) {
        setApplyOpenId(null);
        setCoverLetter("");
      } else {
        setApplyOpenId(jobId);
        setCoverLetter("");
      }
    };

    const handleSubmitApplication = async (jobId) => {
      try {
        await applyToJob({ jobId, coverLetter });
        setSuccessMessages((prev) => ({
          ...prev,
          [jobId]: "applied"
        }));
        setApplyOpenId(null);
        setCoverLetter("");
        // local applied set
        setAppliedSet((prevSet) => new Set(prevSet).add(jobId));
      } catch (err) {
        console.error("Failed to apply:", err);
        alert("Failed to apply");
      }
    };

    const handleShortlist = async (jobId) => {
      try {
        await addJobToShortlist(userId, jobId);
        setSuccessMessages((prev) => ({
          ...prev,
          [jobId]: "shortlisted"
        }));
        setShortlistedSet((prevSet) => new Set(prevSet).add(jobId)); // local shortlist set
      } catch (err) {
        console.error("Error adding job to shortlist:", err);
        alert("Error shortlisting job");
      }
    };



    const handleViewModeChange = (mode) => {
        setViewMode(mode);
      };

    const handleApplyFilters = (selectedFilters) => {
    if (!selectedFilters || selectedFilters.length === 0) {
      setJobs(allJobs);
      return;
    }
    const filterMap = {
      graduate: "Graduate",
      fullTime: "Full-Time",
      partTime: "Part-Time",
      placement: "Placement",
      internship: "Internship",
      apprenticeship: "Apprenticeship",
    };
    const wantedTypes = selectedFilters.map((id) => filterMap[id] || "");
    const filtered = allJobs.filter((job) => {
      return wantedTypes.includes(job.employmentType);
    });

    setJobs(filtered);
  };

  const handleCloseSuccess = (jobId) => {
    setSuccessMessages((prev) => {
      const updated = { ...prev };
      delete updated[jobId];
      return updated;
    });
  };


  return (
    <div className="bg-slate-900 min-h-screen w-full flex flex-col items-center">
      {/* PAGE HEADER */}
      <div className="text-center mt-10 mb-4">
        <h1 className="text-white text-4xl font-bold">Available Job Posts</h1>
        <p className="text-stone-200 text-lg mt-2">Find the perfect opportunity for you</p>
      </div>
      {/*APPLICATIONSBUTTON */}
      <Link 
        to="/user/applications"
        className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        My Applications
      </Link>
      {/* FILTERS */}
      <SwipeFilters onApplyFilters={handleApplyFilters} />

      {/* TOGGLE BUTTONS FOR GRID OR LIST */}
      <div className="flex mb-4 gap-4">
        <button
          onClick={() => handleViewModeChange("grid")}
          className={`px-4 py-2 rounded-md border ${
            viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
          } transition duration-300`}
        >
          Grid View
        </button>
        <button
          onClick={() => handleViewModeChange("list")}
          className={`px-4 py-2 rounded-md border ${
            viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
          } transition duration-300`}
        >
          List View
        </button>
      </div>

      {/* JOBS CONTAINER */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-10"
            : "flex flex-col space-y-4 px-4 pb-10"
        }
      >
        {jobs.map((job) => {
          const isOpen = applyOpenId === job._id;
          const successState = successMessages[job._id];

          // is job already applied or shortlisted
          const alreadyApplied = appliedSet.has(job._id);
          const alreadyShortlisted = shortlistedSet.has(job._id);

          return (
            <div
              key={job._id}
              className="bg-white p-4 rounded-md shadow-md flex flex-col justify-between relative"
              style={{ width: viewMode === "grid" ? "100%" : "auto" }}
            >
              {/* JOB INFO */}
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{job.title}</h2>
                <p className="text-gray-600 mb-1">{job.description}</p>
                <p className="text-gray-600 mb-1">
                  Location: <span className="font-medium">{job.location}</span>
                </p>
                {job.requirements?.length > 0 && (
                  <p className="text-gray-600 mb-1">
                    Requirements: <span className="font-medium">{job.requirements.join(", ")}</span>
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex gap-2">
                {/* APPLY BUTTON */}
                <button
                  onClick={() => handleOpenApply(job._id)}
                  disabled={alreadyApplied} // disable if already applied
                  className={`px-4 py-2 rounded hover:opacity-90 
                    ${alreadyApplied ? "bg-gray-400 text-white" : "bg-blue-600 text-white"}
                  `}
                >
                  {alreadyApplied ? "Applied" : isOpen ? "Cancel" : "Apply"}
                </button>

                {/* SHORTLIST BUTTON */}
                <button
                  onClick={() => handleShortlist(job._id)}
                  disabled={alreadyShortlisted} // disable if already shortlisted
                  className={`px-4 py-2 rounded hover:opacity-90 
                    ${alreadyShortlisted ? "bg-gray-400 text-white" : "bg-green-600 text-white"}
                  `}
                >
                  {alreadyShortlisted ? "Shortlisted" : "Shortlist"}
                </button>
              </div>

              {/* APPLY BOX */}
              {isOpen && !alreadyApplied && (
                <div className="mt-3 transition-all duration-300 border-t border-gray-300 pt-3">
                  <label className="block text-gray-700 mb-1 font-medium">Cover Letter:</label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Type your cover letter..."
                  />
                  <div className="flex mt-2 gap-2">
                    <button
                      onClick={() => handleSubmitApplication(job._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Submit Application
                    </button>
                    <button
                      onClick={() => {
                        setApplyOpenId(null);
                        setCoverLetter("");
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESS POPUP */}
              {successState && (
                <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded relative text-green-800">
                  {successState === "applied" && <>Application successful!</>}
                  {successState === "shortlisted" && <>Job shortlisted!</>}

                  <button
                    onClick={() => handleCloseSuccess(job._id)}
                    className="absolute top-1 right-1 text-green-800 font-bold"
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserJobsPage;