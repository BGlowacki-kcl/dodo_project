// src/guards/AuthGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children, roles = [] }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            const userRole = sessionStorage.getItem('role') || "unLogged";
            if(userRole=="unLogged" && !roles.includes("unLogged")){
                navigate('/signin', { replace: true });
                setLoading(false);
                return;
            }

            if(!roles.includes(userRole)){
                setLoading(false);
                navigate('/forbidden', { replace: true });
                console.error("User not authorized to view this page!")
                return;
            }

            setLoading(false);
        }
        checkAuth();
    }, [navigate])

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
};

export default AuthGuard;