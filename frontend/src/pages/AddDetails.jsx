import React from 'react'
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

function AddDetails() {

    const navigate = useNavigate();

    const handleSignOut = async () => {
        await authService.signOut();
        navigate('/');
    }
  return (
    <>
        <div>AddDetails</div>
        <button onClick={handleSignOut}>Sign Out</button>
    </>
  )
}

export default AddDetails