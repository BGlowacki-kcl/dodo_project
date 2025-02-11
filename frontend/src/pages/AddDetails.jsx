import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const AddDetails = () => {
  const navigate = useNavigate();
  const [profileComplete, setProfileComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      checkProfileCompletion();
    }
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('/api/user/completed', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success && !data.redirect) {
        setProfileComplete(true);
      }
    } catch (err) {
      console.error('Error checking profile:', err);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('token');
    navigate('/SignIn');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      {isLoggedIn && (
        <div className="text-center bg-white p-6 shadow-lg rounded-lg w-96">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>

          {/* Show Complete Profile button only if the profile is incomplete */}
          {!profileComplete && (
            <button
              onClick={() => navigate('/complete-profile')}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 mb-4"
            >
              Complete Profile
            </button>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default AddDetails;
