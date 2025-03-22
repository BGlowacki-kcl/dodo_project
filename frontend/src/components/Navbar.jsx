import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const Navbar = () => {
  const [isEmployer, setIsEmployer] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Function to check auth status
  const checkAuthStatus = () => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    setIsEmployer(role === 'employer');
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('authChange', checkAuthStatus);
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-2 flex items-center">
        
        {/* Logo */}
        <Link to="/" className="flex flex-grow">
          <img src="joborithmLogo.png" className="h-10 w-10" alt="Logo" />
        </Link>

        {/* Centered Navbar Items */}
        <div className="flex justify-center flex-grow">
          {/* NAVBAR FOR EMPLOYERS */}
          {isEmployer && (
            <ul className="flex space-x-12 items-center">
              <li><Link to="/employer/posts" className="">Posts</Link></li>
              <li><Link to="/contact" className="">Contact Us</Link></li>
              <li><Link to="/employer-dashboard" className="">Dashboard</Link></li>
              <li><button onClick={handleSignOut} className="">Log Out</button></li>
            </ul>
          )}

          {/* NAVBAR FOR LOGGED-IN USERS (NON-EMPLOYERS) */}
          {isLoggedIn && !isEmployer && (
            <ul className="flex space-x-12 items-center">
              <li><Link to="/" className="">Home</Link></li>
              <li><Link to="/search-results" className="">All Jobs</Link></li>
              <li><Link to="/swipe" className="">Swipe Jobs</Link></li>
              <li><Link to="/contact" className="">Contact Us</Link></li>
              <li><Link to="/applicant-dashboard" className="">Dashboard</Link></li>
              <li><button onClick={handleSignOut} className="">Log Out</button></li>
            </ul>
          )}

          {/* NAVBAR FOR GUESTS (NOT LOGGED IN) */}
          {!isLoggedIn && (
            <ul className="flex space-x-12 items-center">
              <li><Link to="/" className="">Home</Link></li>
              <li><Link to="/search-results" className="">All Jobs</Link></li>
              <li><Link to="/contact" className="">Contact Us</Link></li>
              <li><Link to="/signup" className="">Sign Up</Link></li>
              <li><Link to="/signin" className="">Login</Link></li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
