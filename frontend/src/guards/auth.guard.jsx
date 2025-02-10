// src/guards/AuthGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { authService } from '../services/auth.service';

const AuthGuard = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if(!token){
            navigate('/signin', { replace: true });
            return;
        }

        authService.checkIfProfileCompleted(navigate);
        setLoading(false);
    }, [])

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
};

export default AuthGuard;