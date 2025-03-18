import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const EmployerSideBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await authService.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navItems = [
        {
            title: 'Dashboard',
            path: '/employer-dashboard',
            icon: '📊'
        },
        {
            title: 'Job Posts',
            path: '/employer/posts',
            icon: '📝'
        }
    ];

    return (
        <div className="fixed left-0 top-15 h-screen w-64 bg-[#1B2A41] shadow-lg flex flex-col">
            <div className="p-6 flex items-center">
                <h2 className="text-xl font-bold text-white">Employer Panel</h2>
            </div>

            <nav className="flex-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-6 py-3 text-white hover:bg-gray-200 transition-colors duration-200
                            ${location.pathname === item.path ? 'bg-white text-gray-700 shadow-sm' : ''}`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.title}</span>
                    </Link>
                ))}
            </nav>

            <button
                onClick={handleSignOut}
                className="flex items-center px-6 py-3 mt-auto mb-8 text-white hover:bg-gray-200 transition-colors duration-200"
            >
                <span className="mr-3">👋</span>
                <span>Sign Out</span>
            </button>
        </div>
    );
};

export default EmployerSideBar;