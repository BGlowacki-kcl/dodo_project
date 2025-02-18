import { useState } from "react";
import ApplicantShortlist from "../../components/Shortlist";
import ApplicantActivity from "../../components/Activity";
import ApplicantProfile from "../../components/Profile";
import ApplicantLogout from "../../components/Logout";

const ApplicantDashboard = () => {
    const [activeView, setActiveView] = useState("activity");

    return (
        <div className="min-h-screen bg-[#0C1821] flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#1B2A41] shadow-lg p-4 border-r border-[#324A5F] flex flex-col h-screen">
                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveView("activity")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            activeView === "activity"
                                ? "bg-[#324A5F] text-white font-medium"
                                : "hover:bg-[#324A5F]/30 text-gray-200"
                        }`}
                    >
                        Activity
                    </button>
                    <button
                        onClick={() => setActiveView("shortlist")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            activeView === "shortlist"
                                ? "bg-[#324A5F] text-white font-medium"
                                : "hover:bg-[#324A5F]/30 text-gray-200"
                        }`}
                    >
                        Job Shortlist
                    </button>
                    <button
                        onClick={() => setActiveView("profile")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            activeView === "profile"
                                ? "bg-[#324A5F] text-white font-medium"
                                : "hover:bg-[#324A5F]/30 text-gray-200"
                        }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveView("logout")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            activeView === "logout"
                                ? "bg-[#324A5F] text-white font-medium"
                                : "hover:bg-[#324A5F]/30 text-gray-200"
                        }`}
                    >
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 max-w-7xl mx-auto bg-[#0C1821]">
                {activeView === "activity" && <ApplicantActivity />}
                {activeView === "shortlist" && <ApplicantShortlist />}
                {activeView === "profile" && <ApplicantProfile />}
                {activeView === "logout" && <ApplicantLogout />}
            </div>
        </div>
    );
};

export default ApplicantDashboard;