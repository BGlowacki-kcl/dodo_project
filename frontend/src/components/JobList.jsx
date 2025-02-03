import React from 'react';

const JobList = ({ jobs, onSelectJob }) => {
    return (
        <div className="bg-white p-4 shadow rounded">
            <h2 className="text-xl font-bold mb-4">Your Job Posts</h2>
            <ul>
                {jobs.map((job, index) => (
                    <li
                        key={index}
                        onClick={() => onSelectJob(job)}
                        className="cursor-pointer mb-2 p-2 border rounded hover:bg-gray-200"
                    >
                        {job}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default JobList;
