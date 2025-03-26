/**
 * EmployerLogin.jsx
 *
 * This component provides the login form for employers.
 * - Allows employers to sign in with their email and password.
 * - Displays error messages and loading states.
 * - Includes a toggle to show or hide the password.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { useNotification } from "../../context/notification.context";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const EmployerLogin = () => {
  // ----------------------------- State Variables -----------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showNotification = useNotification();

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles the login form submission.
   * @param {Object} e - The form submission event.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Attempt to log in as an employer
      await authService.signIn(email, password, navigate, "employer");
      showNotification("Successfully logged in!", "success");
      navigate("/employer-dashboard"); // Navigate to employer dashboard after successful login
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Invalid credentials";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- Render -----------------------------
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Employer Login
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in to manage your job posts
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-4">
          <Link to="/signin" className="text-sm text-blue-500 hover:text-blue-700">
            Are you a jobseeker? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployerLogin;