import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo on the left */}
        <Link to="/" className="flex items-center ml-4">
          <img
            src="https://via.placeholder.com/50"
            className="h-10 w-10"
          />
        </Link>

        {/* Navigation Links */}
        <ul className="flex space-x-12 mr-60">
          <li>
            <Link to="/" className="text-gray-800 text-lg font-medium transition duration-300 ease-in-out hover:font-bold hover:bg-gray-200 px-3 py-2 rounded-md">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="text-gray-800 text-lg font-medium transition duration-300 ease-in-out hover:font-bold hover:bg-gray-200 px-3 py-2 rounded-md">
              About Us
            </Link>
          </li>
          <li className="relative group">
            <Link to="#" className="text-gray-800 text-lg font-medium transition duration-300 ease-in-out hover:font-bold hover:bg-gray-200 px-3 py-2 rounded-md"> 
              For Employers
            </Link>
            {/* Dropdown Menu */}
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ul className="py-2">
                <li>
                  <Link
                    to="/employer-login"
                    className="block px-4 py-2 text-gray-800 font-medium transition duration-300 ease-in-out hover:font-bold hover:bg-gray-200 rounded-md"
                  >
                    Employer Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/employer-register"
                    className="block px-4 py-2 text-gray-800 font-medium transition duration-300 ease-in-out hover:font-bold hover:bg-gray-200 rounded-md"
                  >
                    How to join us
                  </Link>
                </li>
              </ul>
            </div>
          </li>
          <li>
            <Link to="/contact" className="text-gray-800 text-lg font-medium transition duration-300 ease-in-out hover:font-bold hover:bg-gray-200 px-3 py-2 rounded-md">
              Contact Us
            </Link>
          </li>
        </ul>

        {/* TODO: use code below in an if statment if user is logged in */}

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

export default Navbar;