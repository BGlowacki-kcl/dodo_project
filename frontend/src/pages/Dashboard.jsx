import React from 'react'
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();

    const handleSignOut = () => {
        authService.signOut;
        navigate('/');
    }
  return (
    <div>
        <h1>Dashboard</h1>
        <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}

export default Dashboard;