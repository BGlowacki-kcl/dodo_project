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
        setTimeout(onSwipe, 300);
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
            className={`w-full h-[80vh] max-h-[700px] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ease-out
        ${action === "skip" ? "-translate-x-48 scale-90 opacity-50" : ""}
        ${action === "shortlist" ? "translate-x-48 scale-90 opacity-50" : ""}
      `}
        >
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                <div className="absolute top-4 left-4 bg-white text-blue-600 px-3 py-1 text-xs font-bold rounded-full">
                    {employmentType}
                </div>
                <div className="pt-8 pb-4">
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                    <p className="text-xl text-blue-100">{company}</p>
                    <p className="text-md text-blue-200 mt-1">{location}</p>
                </div>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
                <div className="mb-4">
                    {salaryRange && (
                        <p className="text-lg font-semibold text-gray-800">
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
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h4>
                <p className="text-gray-700 whitespace-pre-line">{description}</p>
            </div>

            <div className="flex justify-between px-6 py-4 bg-gray-100 border-t border-gray-200">
                <button
                    onClick={() => handleAction("skip")}
                    className="w-32 h-12 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95"
                >
                    ❌ Skip
                </button>
                <button
                    onClick={() => handleAction("shortlist")}
                    className="w-32 h-12 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95"
                >
                    ✅ Shortlist
                </button>
            </div>
        </div>
    );
};

export default SwipeBox;