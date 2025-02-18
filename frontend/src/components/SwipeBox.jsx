import React, { useState, useEffect } from "react";

const SwipeBox = ({ companyLogo, companyName, role, jobDescription, jobType, location, salary, duration, onSwipe }) => {
    const [action, setAction] = useState(null);

    const handleAction = (actionType) => {
        setAction(actionType);
        setTimeout(onSwipe, 500);
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
        if (event.key === "ArrowLeft") handleAction("skip");
        if (event.key === "ArrowRight") handleAction("shortlist");
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);}, []);

    return (

        <div
        className={`w-[340px] h-[455px] flex flex-col bg-[#ccc9dc] rounded-lg shadow-xl overflow-hidden
                    transition-transform duration-500 ease-in-out
                    ${action === "skip" ? "-translate-x-48 scale-75 blur-md opacity-50" : ""}
                    ${action === "shortlist" ? "translate-x-48 scale-75 blur-md opacity-50" : ""}
        `}
        >

            <div className="relative">
                <div className="absolute top-2 left-2 bg-[#324a5f] text-white px-3 py-1 text-xs font-semibold rounded-full">
                {jobType}
                </div>
            </div>
            <img src={companyLogo} alt={companyName} className="w-full h-36 object-cover" />

            <div className="p-4 flex-grow">
                <h3 className="text-2xl font-bold text-black">{role}</h3>
                <p className="text-xl text-gray-900">{companyName}</p>
                <p className="text-md text-gray-800 mt-2">{location} • {duration}</p>
                <p className="text-md text-gray-800 mt-2 line-clamp-3">{jobDescription}</p>
                <p className="text-md text-gray-700 mt-2">{salary}</p>
            </div>

            <div className="flex justify-between px-4 bg-[#324a5f] mt-auto">
                <button onClick={() => handleAction("skip")} className="px-4 py-2 text-slate-100 rounded-lg transition w-32 h-16 hover:scale-125">
                    ❌ Skip
                </button>
                <button onClick={() => handleAction("shortlist")} className="px-4 py-2 text-slate-100 rounded-lg transition w-32 h-16 hover:scale-125">
                    ✅ Shortlist
                </button>
            </div>
            
        </div>
        );
    };

export default SwipeBox;
