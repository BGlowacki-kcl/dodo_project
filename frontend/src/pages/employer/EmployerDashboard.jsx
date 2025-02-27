import { useState, useEffect } from "react";
import JobList from "../../components/JobList.jsx";
import Metrics from "../../components/Metrics.jsx";
import Statistics from "../../components/Statistics.jsx";
import { getAllJobs } from "../../services/jobService";
import React from 'react';
import EmployerSideBar from '../../components/EmployerSideBar';

const EmployerDashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployerSideBar />
            
            {/* Main Content Area */}
            <div className="ml-64 p-8 flex-1">
                {/* Large White Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[80vh] relative">
                    {/* Example of smaller cards you can place on top */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Smaller Card 1 */}
                        <div className="bg-gray-50 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-2">Total Jobs Posted</h3>
                            <p className="text-3xl font-bold text-blue-600">12</p>
                        </div>

                        {/* Smaller Card 2 */}
                        <div className="bg-gray-50 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-2">Active Applications</h3>
                            <p className="text-3xl font-bold text-green-600">48</p>
                        </div>

                        {/* Smaller Card 3 */}
                        <div className="bg-gray-50 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-2">Positions Filled</h3>
                            <p className="text-3xl font-bold text-purple-600">5</p>
                        </div>
                    </div>

                    {/* You can add more content or cards here */}
                </div>
            </div>
        </div>
    );
};

export default EmployerDashboard;


