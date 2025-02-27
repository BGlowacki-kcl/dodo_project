import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Link } from 'react-router-dom';

const EmployerSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = isLogin 
        ? await authService.signIn(email, password, 'employer')
        : await authService.signUp(email, password, 'employer');

      if (response?.success) {
        navigate('/employer-dashboard');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      setError(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          {isLogin ? 'Employer Sign In' : 'Create Employer Account'}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isLogin ? 'Sign in to your employer account' : 'Register as an employer'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your company email"
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
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-gray-600 text-sm">
            {isLogin ? "Don't have an employer account?" : "Already have an account?"} 
          </span>
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-500 font-medium hover:text-blue-700"
          >
            {isLogin ? 'Register' : 'Sign In'}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link to="/signin" className="text-sm text-blue-500 hover:text-blue-700">
            Looking for a job? Sign in as a job seeker
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployerSignIn;