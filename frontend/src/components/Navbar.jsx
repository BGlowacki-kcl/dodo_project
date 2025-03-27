/**
 * Navbar.jsx
 *
 * This component represents the navigation bar for the application.
 * - Displays different navigation options based on the user's authentication and role.
 * - Includes a logout confirmation modal.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useNotification } from "../context/notification.context";
import ModalMessages from "./ModalMessages";

const Navbar = () => {
  const [isEmployer, setIsEmployer] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const showNotification = useNotification();

  // ----------------------------- Helpers -----------------------------
  /**
   * Checks if the current path matches the given path to apply active styles.
   * @param {string} path - The path to check.
   * @returns {string} - The appropriate class for the link.
   */
  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-100 text-blue-600 rounded-lg px-3 py-3"
      : "text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded-lg px-3 py-3 transition-all";
  };

  /**
   * Checks the user's authentication status and role.
   */
  const checkAuthStatus = () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    setIsEmployer(role === "employer");
    setIsLoggedIn(!!token);
  };

  // ----------------------------- Effects -----------------------------
  /**
   * Effect to check authentication status on component mount and on storage changes.
   */
  useEffect(() => {
    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);
    window.addEventListener("authChange", checkAuthStatus);
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("authChange", checkAuthStatus);
    };
  }, []);

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles the logout process and navigates the user to the home page.
   */
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      showNotification("You have been successfully logged out", "success");
      setShowLogoutModal(false);
      navigate("/");
    } catch (error) {
      showNotification("Error logging out. Please try again.", "error");
    }
  };

  // ----------------------------- Render -----------------------------
  return (
    <>
      <nav className="bg-white shadow-md w-full sticky top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-14">
            <img src="/joborithmLogo.png" className="h-15 w-14" alt="Logo" />
            <span className="text-lg font-semibold">Jobirithm</span>
          </Link>

          {/* Navbar for Logged-in Employers */}
          {isLoggedIn && isEmployer && (
            <div className="flex justify-between flex-grow">
              <ul className="flex space-x-4 items-center">
                <li>
                  <Link to="/employer/posts" className={`text-base ${isActive("/employer/posts")}`}>
                    Posts
                  </Link>
                </li>
                <li>
                  <Link to="/employer-dashboard" className={`text-base ${isActive("/employer-dashboard")}`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className={`text-base ${isActive("/contact")}`}>
                    Contact Us
                  </Link>
                </li>
              </ul>
              <ul className="flex space-x-4 items-center">
                <li>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="text-base px-4 py-2 rounded-lg border border-blue-600 bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Navbar for Logged-in Non-Employers */}
          {isLoggedIn && !isEmployer && (
            <div className="flex justify-between flex-grow">
              <ul className="flex space-x-4 items-center">
                <li>
                  <Link to="/" className={`text-base ${isActive("/")}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/search-results" className={`text-base ${isActive("/search-results")}`}>
                    All Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/swipe" className={`text-base ${isActive("/swipe")}`}>
                    Swipe Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className={`text-base ${isActive("/contact")}`}>
                    Contact Us
                  </Link>
                </li>
              </ul>
              <ul className="flex space-x-4 items-center">
                <li>
                  <Link to="/applicant-dashboard" className={`text-base ${isActive("/applicant-dashboard")}`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="text-base px-4 py-2 rounded-lg border border-blue-600 bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Navbar for Guests */}
          {!isLoggedIn && (
            <div className="flex justify-between flex-grow">
              <ul className="flex space-x-4 items-center">
                <li>
                  <Link to="/" className={`text-base ${isActive("/")}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/search-results" className={`text-base ${isActive("/search-results")}`}>
                    All Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className={`text-base ${isActive("/contact")}`}>
                    Contact Us
                  </Link>
                </li>
              </ul>
              <ul className="flex space-x-4 items-center">
                <li>
                  <Link
                    to="/signup"
                    className={`text-base px-4 py-2 rounded-lg border border-blue-600 ${
                      location.pathname === "/signup" ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-50"
                    } transition-all`}
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signin"
                    className={`text-base px-4 py-2 rounded-lg border border-blue-600 ${
                      location.pathname === "/signin" ? "bg-blue-700 text-white" : "bg-blue-100 hover:bg-blue-200"
                    } text-blue-600 transition-all`}
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <ModalMessages
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        message="Are you sure you want to log out? You will need to sign in again to access your account."
        onConfirm={handleSignOut}
        confirmText="Log Out"
        cancelText="Cancel"
      />
    </>
  );
};

export default Navbar;