/**
 * Authentication Guard Component
 * Manages route protection based on user roles
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Protects routes based on user role permissions
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components to render when authorized
 * @param {Array} props.roles - Array of roles allowed to access the route
 * @returns {JSX.Element} - Protected route component
 */
const AuthGuard = ({ children, roles = [] }) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        checkUserAuthorization();
    }, [navigate]);

    /**
     * Checks if the user is authorized to access the current route
     */
    const checkUserAuthorization = async () => {
        setLoading(true);
        const userRole = sessionStorage.getItem('role') || "unLogged";
        
        if (isUnauthorizedUnloggedUser(userRole)) {
            redirectToSignIn();
            return;
        }

        if (isUnauthorizedLoggedUser(userRole)) {
            redirectToForbidden();
            return;
        }

        setLoading(false);
    };

    /**
     * Checks if an unlogged user is trying to access a protected route
     * @param {string} userRole - Current user role
     * @returns {boolean} - True if user is unlogged and not allowed
     */
    const isUnauthorizedUnloggedUser = (userRole) => {
        return userRole === "unLogged" && !roles.includes("unLogged");
    };

    /**
     * Checks if a logged user is trying to access a route they don't have permission for
     * @param {string} userRole - Current user role
     * @returns {boolean} - True if user doesn't have the required role
     */
    const isUnauthorizedLoggedUser = (userRole) => {
        return !roles.includes(userRole);
    };

    /**
     * Redirects unauthorized unlogged users to sign in page
     */
    const redirectToSignIn = () => {
        navigate('/signin', { replace: true });
        setLoading(false);
    };

    /**
     * Redirects unauthorized logged users to forbidden page
     */
    const redirectToForbidden = () => {
        setLoading(false);
        navigate('/forbidden', { replace: true });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return children;
};

export default AuthGuard;