import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = isLogin 
        ? await authService.signin(email, password)
        : await authService.signup(email, password);

      // Check if profile is complete
      if (response.isProfileComplete || !isLogin) {
        navigate('/dashboard');
      } else {
        navigate('/complete-profile');
      }
    } catch (error) {
      console.error('Authentication error', error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="mb-4 text-xl">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 mb-3"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 mb-3"
        />
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
        <button 
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="ml-2 text-blue-500 hover:text-blue-700"
        >
          {isLogin ? 'Need an account?' : 'Already have an account?'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;