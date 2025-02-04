import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EmployerNavbar = () => {
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* Employer Dashboard Link */}
        <Link to="/Employer-dashboard" className="flex items-center ml-4">
          <span className="text-xl font-bold ml-2">Employer Dashboard</span>
        </Link>

        {/* Navigation Links */}
        <ul className="flex space-x-12 mr-60">
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
        </ul>

        {/* TODO: use code below in an if statement if user is logged in */}

        {/* Profile Section with Dropdown */}
        {/* <div className="relative">
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="h-10 w-10 rounded-full"
            /> */}
            {/* TODO: add if statement to check if user is logged in to display their name */}
          {/* </div> */}

          {/* Dropdown Menu */}
          {/* {isDropdownOpen && (
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
          )} */}
        {/* </div> */}
      </div>
    </nav>
  );
};

export default EmployerNavbar;
