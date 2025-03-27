import React, { useEffect, useState } from "react";

const JobCard = ({ job, isLoggedIn, shortlist, handleJobClick, handleAddToShortlist }) => {
    const [isShortlisted, setIsShortlisted] = useState(false);
    useEffect(() => {
        if(shortlist.has(job._id)){
            setIsShortlisted(true);
        }
    }, [shortlist]);
    return (
        <div 
            key={job._id} 
            className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 w-full relative cursor-pointer 
                      hover:shadow-xl transition-shadow duration-300 hover:bg-slate-100"
            onClick={() => handleJobClick(job._id)}
        >
            {/* Add to shortlist or already added */}
            {isLoggedIn && (
                isShortlisted ? (
                    <button 
                        className="absolute top-3 right-3 text-primary rounded-full w-8 h-8 flex items-center justify-center 
                                   shadow-md bg-secondary"
                        disabled
                        title="Already added to shortlist"
                    >
                        ✓
                    </button>
                ) : (
                    <button 
                        className="absolute top-3 right-3 bg-primary text-dtext rounded-full w-8 h-8 flex items-center justify-center 
                                   shadow-md hover:bg-secondary hover:text-ltext transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToShortlist(job._id);
                        }}
                        title="Add to shortlist"
                    >
                        +
                    </button>
                )
            )}

            {/* Job Info Section */}
            <div className="w-full flex flex-col space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
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
                    <span className="font-semibold text-gray-700">Requirements:</span> {job.requirements.join(", ")}
                </p>
                <p className="text-gray-500 text-xs line-clamp-2">{job.description}</p>
            </div>
        </div>
    );
};

export default JobCard;
