import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useNotification } from '../../context/notification.context';

const EmployerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showNotification = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Use the auth service to sign in
      await authService.signIn(email, password, () => {
        // After successful login, check if user is employer
        const userRole = sessionStorage.getItem('role');
        if (userRole === 'employer') {
          showNotification('Successfully logged in!', 'success');
          navigate('/employer-dashboard'); // Navigate to employer dashboard
        } else {
          throw new Error('Unauthorized. Employer access only.');
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid login credentials');
      showNotification('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Employer Login
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in to manage your job posts
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 ${
              loading && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        

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
