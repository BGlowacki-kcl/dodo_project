// src/guards/AuthGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

const AuthGuard = ({ children, roles = [] }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            if(!token){
                navigate('/signin', { replace: true });
                return;
            }
            const userRole = await userService.getUserRole();
            
            console.log(userRole);
            console.log(roles);
            if(!roles.includes(userRole)){
                setLoading(false);
                navigate('/forbidden', { replace: true });
                return new Error("User not authorized to view this page!");
            }

            authService.checkIfProfileCompleted(navigate);
            setLoading(false);
        }
        checkAuth();
    }, [])

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
};

export default AuthGuard;