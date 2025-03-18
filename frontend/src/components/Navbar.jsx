import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

// ProfileDropdown component used only for employers
const ProfileDropdown = ({ isDropdownOpen, toggleDropdown }) => (
  <div className="relative">
    <div
      className="flex items-center space-x-4 cursor-pointer"
      onClick={toggleDropdown}
    >
      <img
        src="https://via.placeholder.com/40"
        alt="Profile"
        className="h-10 w-10 rounded-full"
      />
    </div>
    {isDropdownOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
        <ul className="py-2">
          <li>
            <Link
              to="/profile"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Settings
            </Link>
          </li>
          <li>
            <Link
              to="/logout"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Log out
            </Link>
          </li>
        </ul>
      </div>
    )}
  </div>
);

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check session storage for role and token when the component mounts
  // useEffect(() => {
  //   const role = sessionStorage.getItem('role');
  //   setIsEmployer(role === 'employer');
  //   setIsLoggedIn(!!sessionStorage.getItem('token'));
  // }, []);
    // Create a function to check auth status
    const checkAuthStatus = () => {
      const token = sessionStorage.getItem('token');
      const role = sessionStorage.getItem('role');
      setIsEmployer(role === 'employer');
      setIsLoggedIn(!!token);
    };
  
    // Listen for auth changes
    useEffect(() => {
      checkAuthStatus();
      
      // Add event listener for storage changes
      window.addEventListener('storage', checkAuthStatus);
      
      // Create a custom event listener for auth changes
      window.addEventListener('authChange', checkAuthStatus);
      
      return () => {
        window.removeEventListener('storage', checkAuthStatus);
        window.removeEventListener('authChange', checkAuthStatus);
      };
    }, []);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  }

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center ml-4">
          <img
            src="https://via.placeholder.com/50"
            className="h-10 w-10"
            alt="Logo"
          />
        </Link>
       

        {isEmployer ? (
          // Employer Navigation: Shows the ProfileDropdown
          <>
            <Link to="/Employer-dashboard" className="flex items-center ml-4">
              <span className="text-xl font-bold ml-2">Employer Dashboard</span>
            </Link>
            <ul className="flex space-x-12 mr-60 items-center">
              <li>
                <Link
                  to="/posts"
                  className="text-gray-800 text-lg font-medium px-3 py-2 rounded-md hover:font-semibold hover:bg-gray-200 transition duration-300"
                >
                  Posts
                </Link>
              </li>
              <li>
                <Link
                  to="/applicants"
                  className="text-gray-800 text-lg font-medium px-3 py-2 rounded-md hover:font-semibold hover:bg-gray-200 transition duration-300"
                >
                  Applicants
                </Link>
              </li>
              <li>
                <ProfileDropdown
                  isDropdownOpen={isDropdownOpen}
                  toggleDropdown={toggleDropdown}
                />
              </li>
            </ul>
          </>
        ) : (
          // Non-Employer (General) Navigation
          <ul className="flex space-x-12 mr-60 items-center">
            <li>
              <Link
                to="/"
                className="text-gray-800 text-lg font-medium px-3 py-2 rounded-md hover:font-semibold hover:bg-gray-200 transition duration-300"
              >
                Home
              </Link>
            </li>
            <li className="relative group">
              <Link
                to="#"
                className="text-gray-800 text-lg font-medium px-3 py-2 rounded-md hover:font-semibold hover:bg-gray-200 transition duration-300"
              >
                For Employers
              </Link>
              {/* Dropdown Menu on Hover */}
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ul className="py-2">
                  <li>
                    <Link
                      to="/employer-login"
                      className="block px-4 py-2 text-gray-800 font-medium hover:font-semibold hover:bg-gray-200 rounded-md transition duration-300"
                    >
                      Employer Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/employer-register"
                      className="block px-4 py-2 text-gray-800 font-medium hover:font-semibold hover:bg-gray-200 rounded-md transition duration-300"
                    >
                      How to join us
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            {/* For Users (new) */}
            <li className="relative group">
              <Link
                to="#"
                className="text-gray-800 text-lg font-medium px-3 py-2 rounded-md hover:font-semibold hover:bg-gray-200 transition duration-300"
              >
                Jobs
              </Link>
              <div
                className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-300"
              >
                <ul className="py-2">
                  <li>
                    <Link
                      to="/user/jobs"
                      className="block px-4 py-2 text-gray-800 font-medium
                                hover:font-semibold hover:bg-gray-200
                                rounded-md transition duration-300"
                    >
                      Browse Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/user/applications"
                      className="block px-4 py-2 text-gray-800 font-medium
                                hover:font-semibold hover:bg-gray-200
                                rounded-md transition duration-300"
                    >
                      My Applications
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <Link
                to="/contact"
                className="text-gray-800 text-lg font-medium px-3 py-2 rounded-md hover:font-semibold hover:bg-gray-200 transition duration-300"
              >
                Contact Us
              </Link>
            </li>
            {isLoggedIn && (
              // For non-employers, show a profile picture that links to the applicant dashboard
              <li>
                <Link to="/applicant-dashboard">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="Profile"
                    className="h-10 w-10 rounded-full"
                  />
                </Link>
              </li>
            )}
          </ul>
        )}

        {/* Sign Up Button (Shown only when not logged in) */}
        {!isLoggedIn && (
          <Link
            to="/signup"
            className="ml-4 text-lg font-medium px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Account
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
