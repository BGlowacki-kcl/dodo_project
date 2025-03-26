import React from "react";
import WhiteBox from "./WhiteBox";
import DeadlineBadge from "./DeadlineBadge";

const JobCard = ({ job, isLoggedIn, isShortlisted, handleJobClick, handleAddToShortlist, handleRemoveFromShortlist, showNotification }) => {
    return (
        <WhiteBox 
            className="relative cursor-pointer hover:shadow-xl transition-shadow duration-300 hover:bg-slate-100"
            onClick={() => handleJobClick(job._id)}
        >
            {/* Deadline Badge */}
            <div className="absolute top-3 right-3">
                <DeadlineBadge deadline={job.deadline} />
            </div>

            {/* Job Info Section */}
            <div className="w-full flex flex-col space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                <p className="text-gray-600 text-sm font-medium">
                    <span className="font-semibold text-gray-700">Company:</span> {job.company}
                </p>
                <p className="text-gray-600 text-sm">
                    <span className="font-semibold text-gray-700">Location:</span> {job.location}
                </p>
                <p className="text-gray-600 text-sm">
                    <span className="font-semibold text-gray-700">Type:</span> {job.employmentType}
                </p>
                <p className="text-gray-600 text-sm truncate">
                    <span className="font-semibold text-gray-700">Requirements:</span> {Array.isArray(job.requirements) ? job.requirements.join(", ") : "Not specified"}
                </p>
            </div>

            {/* Add to shortlist or already added */}
            {isLoggedIn && (
                isShortlisted ? (
                    <button 
                        className="absolute bottom-3 right-3 text-white rounded-full w-10 h-10 flex items-center justify-center 
                                   shadow-md bg-green-500 hover:bg-green-600 transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromShortlist(job._id);
                            showNotification("Job removed from shortlist", "success");
                        }}
                        title="Remove from shortlist"
                    >
                        ✓
                    </button>
                ) : (
                    <button 
                        className="absolute bottom-3 right-3 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center 
                                   shadow-md hover:bg-blue-700 hover:shadow-lg transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToShortlist(job._id);
                            showNotification("Job added to shortlist", "success");
                        }}
                        title="Add to shortlist"
                    >
                        +
                    </button>
                )
            )}
        </WhiteBox>
    );
};

export default JobCard;