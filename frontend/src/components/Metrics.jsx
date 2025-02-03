import React from 'react';

const Metrics = ({ selectedJob }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-100 p-6 shadow rounded">
                <h3 className="text-lg font-bold">Applicants</h3>
                <p className="text-2xl">10 (placeholder)</p>
            </div>

            <div className="bg-yellow-100 p-6 shadow rounded">
                <h3 className="text-lg font-bold">Potential Applicants</h3>
                <p className="text-2xl">5 (placeholder)</p>
            </div>

            <div className="bg-blue-100 p-6 shadow rounded col-span-2">
                <h3 className="text-lg font-bold">Currently Viewing</h3>
                <p className="text-xl">{selectedJob}</p>
            </div>
        </div>
    );
};

export default Metrics;
