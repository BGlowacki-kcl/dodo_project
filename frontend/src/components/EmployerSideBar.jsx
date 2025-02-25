import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const EmployerSideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = () => {
        navigate('/');
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
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
        <div className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'} bg-[#1B2A41] shadow-lg flex flex-col rounded-r-3xl transition-width duration-300`}>
            <div className="p-6 flex justify-between items-center">
                <h2 className={`text-xl font-bold text-white ${isCollapsed ? 'hidden' : 'block'}`}>Employer Panel</h2>
                <button onClick={toggleCollapse} className="text-white">
                    {isCollapsed ? '➡️' : '⬅️'}
                </button>
            </div>

            <nav className="flex-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-6 py-3 text-white hover:bg-gray-200 transition-colors duration-200
                            ${location.pathname === item.path ? 'bg-white text-gray-700 shadow-sm mr-4 rounded-r-full' : ''}`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        <span className={`${isCollapsed ? 'hidden' : 'block'}`}>{item.title}</span>
                    </Link>
                ))}
            </nav>

            <button
                onClick={handleSignOut}
                className="flex items-center px-6 py-3 mt-auto mb-8 text-white hover:bg-gray-200 transition-colors duration-200 hover:mr-4 hover:rounded-r-full"
            >
                <span className="mr-3">👋</span>
                <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Sign Out</span>
            </button>
        </div>
    );
};

export default EmployerSideBar;