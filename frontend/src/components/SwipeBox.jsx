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
                      jobId,
                  }) => {
    const [action, setAction] = useState(null);
    const localLogoUrl = "./assets/amazon.jpg";

    const handleAction = (actionType) => {
        setAction(actionType);
        if (actionType === "shortlist" && onShortlist) {
            onShortlist(jobId); // call the callback with the job's id
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
            className={`w-[360px] h-[480px] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden transition-transform duration-500 ease-in-out
        ${action === "skip" ? "-translate-x-48 scale-75 blur-sm opacity-50" : ""}
        ${action === "shortlist" ? "translate-x-48 scale-75 blur-sm opacity-50" : ""}
      `}
        >
            <div className="relative">
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
                    {employmentType}
                </div>
            </div>
            <img src={localLogoUrl} alt={company} className="w-full h-40 object-cover" />

            <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                <p className="text-xl text-gray-700 mt-1">{company}</p>
                <p className="text-md text-gray-600 mt-2">{location}</p>
                <p className="text-md text-gray-600 mt-2 line-clamp-3">{description}</p>
                {salaryRange && (
                    <p className="text-md text-gray-800 mt-2">
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
                    onClick={() => handleAction("skip")}
                    className="w-32 h-12 bg-red-500 text-white rounded-lg transition transform hover:scale-110"
                >
                    ❌ Skip
                </button>
                <button
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
