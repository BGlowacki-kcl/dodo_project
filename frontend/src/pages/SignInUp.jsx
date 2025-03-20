import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Link } from 'react-router-dom';
import { useNotification } from '../context/notification.context';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const showNotification = useNotification();
  const isLogin = location.pathname === '/signin';

  // Reset form fields when switching between sign-in and sign-up
  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setShowPassword(false);
  }, [location.pathname]);

  // Password strength validation
  const isPasswordStrong = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Client-side validation for sign-up
      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (!isPasswordStrong(password)) {
          throw new Error("Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.");
        }
      }    

      // Call auth service and get response
      const response = await (isLogin 
        ? authService.signIn(email, password, navigate, "jobSeeker") 
        : authService.signUp(email, password, false, navigate));

      // Use server-provided message if available, otherwise fallback
      const successMessage = response?.message || (isLogin ? 'Logged in successfully!' : 'Signed up successfully! Please complete your profile.');
      showNotification(successMessage, 'success');

    } catch (error) {
      // Use server-provided error message
      showNotification(error.message, 'error');
      console.error('Authentication error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          {isLogin ? 'Welcome Back!' : 'Create Job Seeker Account'}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isLogin ? 'Sign in to continue' : 'Start your job search today!'}
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

          {/* Confirm Password field (sign-up only) */}
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
            </div>
          )}

          {/* Submit button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 ${
              loading && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
          
          {/* Additional links/info */}
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

        {/* Switch between sign-in and sign-up */}
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

        {/* Employer login link */}
        <div className="text-center mt-4">
          <Link to="/employer-login" className="text-sm text-blue-500 hover:text-blue-700">
            Are you an employer? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;