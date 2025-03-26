import React, { useState, useEffect } from "react";

const SwipeBox = ({
                      title,
                      company,
                      location,
                      description,
                      salaryRange,
                      employmentType,
                      onSwipe,
                      onShortlist,
                      onSkip,
                      jobId,
                  }) => {
    const [action, setAction] = useState(null);

    const handleAction = (actionType) => {
        setAction(actionType);
        if (actionType === "shortlist" && onShortlist) {
            onShortlist(jobId);
        } else if (actionType === "skip" && onSkip) {
            onSkip(jobId);
        }
        setTimeout(onSwipe, 500);
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "ArrowLeft") handleAction("skip");
            if (event.key === "ArrowRight") handleAction("shortlist");
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [onSwipe]);

    return (
        <div
            data-cy="swipe-card"
            data-job-id={jobId}
            className={`w-[360px] h-[480px] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden transition-transform duration-500 ease-in-out
        ${action === "skip" ? "-translate-x-48 scale-75 blur-sm opacity-50" : ""}
        ${action === "shortlist" ? "translate-x-48 scale-75 blur-sm opacity-50" : ""}
      `}
        >
            <div className="relative">
                <div
                    data-cy="employment-type-badge"
                    className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-full"
                >
                    {employmentType}
                </div>
            </div>

            <div className="p-6 flex-grow">
                <h3 data-cy="job-title" className="text-2xl font-bold text-gray-900">{title}</h3>
                <p data-cy="company-name" className="text-xl text-gray-700 mt-1">{company}</p>
                <p data-cy="job-location" className="text-md text-gray-600 mt-2">{location}</p>
                <p data-cy="job-description" className="text-md text-gray-600 mt-2 line-clamp-3">{description}</p>
                {salaryRange && (
                    <p data-cy="salary-range" className="text-md text-gray-800 mt-2">
                        {salaryRange.min && salaryRange.max
                            ? `£${salaryRange.min} - £${salaryRange.max}`
                            : salaryRange.min
                                ? `From £${salaryRange.min}`
                                : salaryRange.max
                                    ? `Up to £${salaryRange.max}`
                                    : null}
                    </p>
                )}
            </div>

            <div className="flex justify-between px-6 py-4 bg-gray-200">
                <button
                    data-cy="skip-button"
                    onClick={() => handleAction("skip")}
                    className="w-32 h-12 bg-red-500 text-white rounded-lg transition transform hover:scale-110"
                >
                    ❌ Skip
                </button>
                <button
                    data-cy="shortlist-button"
                    onClick={() => handleAction("shortlist")}
                    className="w-32 h-12 bg-green-500 text-white rounded-lg transition transform hover:scale-110"
                >
                    ✅ Shortlist
                </button>
            </div>
        </div>
    );
};

export default SwipeBox;