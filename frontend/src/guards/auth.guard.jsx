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
            if(!token && !roles.includes("unLogged")){
                navigate('/signin', { replace: true });
                setLoading(false);
                return;
            }
            const userRole = await userService.getUserRole();
            
            console.log(userRole);
            console.log(roles);
            if(!userRole || !roles.includes(userRole)){
                setLoading(false);
                navigate('/forbidden', { replace: true });
                console.error("User not authorized to view this page!")
                return;
            }
            // if(userRole != "unLogged"){
            //     authService.checkIfProfileCompleted(navigate);
            // }
            console.log("final");
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