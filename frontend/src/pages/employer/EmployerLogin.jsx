import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmployerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Ensure the correct endpoint
      const response = await axios.post('/api/user/login', { email, password });

      if (!response.data.token) {
        throw new Error("Token not received from backend");
      }

      // Save employer session
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('role', response.data.role || 'employer');

      // Notify other components
      window.dispatchEvent(new Event('authChange'));

      // Redirect to employer dashboard
      navigate('/employer-dashboard');
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Invalid login credentials');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold text-center mb-4">Employer Login</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 border rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployerLogin;
