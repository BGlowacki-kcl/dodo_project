/**
 * ApplicantDashboard.jsx
 *
 * This component represents the Applicant Dashboard in the application. It provides:
 * - A sidebar for navigation between different views (Activity, Shortlist, Profile).
 * - A logout option with a confirmation modal.
 * - Dynamic rendering of the selected view.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApplicantShortlist from "../../components/Shortlist";
import ApplicantActivity from "../../components/Activity";
import ApplicantProfile from "../../components/Profile";
import ModalMessages from "../../components/ModalMessages";
import { authService } from "../../services/auth.service";
import useLocalStorage from "../../hooks/useLocalStorage";

const ApplicantDashboard = () => {
  // ----------------------------- State Variables -----------------------------
  const [activeView, setActiveView] = useLocalStorage("activeView", "activity"); // Tracks the current view
  const [showModal, setShowModal] = useState(false); 
  const navigate = useNavigate();

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles user logout by calling the auth service and navigating to the home page.
   */
  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/");
  };

  // ----------------------------- Render -----------------------------
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1B2A41] shadow-lg p-4 border-r border-[#324A5F] flex flex-col min-h-screen">
        <nav className="space-y-2">
          {/* Activity Button */}
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

          {/* Job Shortlist Button */}
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

          {/* Profile Button */}
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

          {/* Logout Button */}
          <button
            onClick={() => setShowModal(true)}
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
      <div className="flex-1 p-8 max-w-7xl mx-auto">
        {activeView === "activity" && <ApplicantActivity />}
        {activeView === "shortlist" && <ApplicantShortlist />}
        {activeView === "profile" && <ApplicantProfile />}
      </div>

      {/* Logout Modal */}
      <ModalMessages
        show={showModal}
        onClose={() => setShowModal(false)}
        message="Are you sure you want to log out?"
        onConfirm={handleSignOut}
        confirmText="Yes"
        cancelText="No"
      />
    </div>
  );
};

export default ApplicantDashboard;