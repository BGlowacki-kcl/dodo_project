// SingInUp page handles logging in and signing up forms depending on the url

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Link } from 'react-router-dom';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useNotification } from '../context/notification.context';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const showNotification = useNotification();
  const isLogin = location.pathname === '/signin';

  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setShowPassword(false);
    setIsEmployer(false);
  }, [location.pathname]);

  // Check if pssword is strong, passes all the t
  const isPasswordStrong = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  // Send request to sign user in or up depending on the page's url to the auth service
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check password constraints and missmatch
      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (!isPasswordStrong(password)) {
          throw new Error("Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.");
        }
      }

      //  Redirect after checking profile completion
      await (isLogin 
        ? authService.signIn(email, password, navigate) 
        : authService.signUp(email, password, isEmployer, navigate));
      
      const successMessage = isLogin ? 'Sign in successful!' : 'Sign up successful! Please complete your profile.';
      showNotification(successMessage, 'success');

    } catch (error) {
      const errorMessage = isLogin ? 'Sign in failed. Please check your email and password.' : 'Sign up failed. Please try again.'; 
      showNotification(errorMessage, 'error');
      console.error('Authentication error:', error.message);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* The main Sign in or up form component */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          {isLogin ? 'Welcome Back!' : 'Create an Account'}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isLogin ? 'Sign in to continue' : 'Join us today!'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
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
          {/* Password field */}
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

          {/* Confirm password field (only if signing up) */}
          {!isLogin && (
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
              <FormControlLabel control={<Checkbox onChange={(e) => setIsEmployer(e.target.value)} />} label="Is employer?" />
            </div>
            
          )}

          {/* Submit form button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 ${
              loading && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
          
          {/* Additional functionality and information */}
          <div className="text-center mt-4">
            {isLogin ? (
              <Link to="#" className="text-sm text-blue-500 hover:text-blue-700">
                Forgot Password?
              </Link>
            ) : (
              <p className="text-sm text-gray-600">
                Password must be at least 8 characters, contain an uppercase letter, a lowercase letter, and a number.
              </p>
            )}
          </div>
        </form>

        {/* Switch between sign in and sign up form */}
        <div className="text-center mt-4">
          <span className="text-gray-600 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"} 
          </span>
          <Link 
            to={isLogin ? '/signup' : '/signin'}
            className="ml-2 text-blue-500 font-medium hover:text-blue-700"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
