// src/guards/AuthGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { authService } from '../services/auth.service';

const AuthGuard = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, (user) => {
    //         if (user) {
    //             setIsAuthenticated(true);
    //         } else {
    //             navigate('/signin', { replace: true });
    //         }
    //         setLoading(false);
    //     });

    //     return () => unsubscribe();
    // }, [navigate]);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if(!token){
            navigate('/signin', { replace: true });
        }

        authService.checkIfProfileCompleted();
    })

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; // or a redirect component
    }

    return children;
};

export default AuthGuard;