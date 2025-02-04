import React from 'react';
// import { Line } from 'react-chartjs-2';

const ApplicantsChart = () => {
    const chartData = {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
        datasets: [
            {
                label: 'Applicants Over Time',
                data: [2, 5, 8, 12, 15],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: true,
            },
        ],
    };

    return (
        <div className="bg-white p-6 shadow rounded">
            <h3 className="text-lg font-bold mb-4">Applicants Over Time</h3>
            {/*<Line data={chartData} />*/}
        </div>
    );
};

export default ApplicantsChart;
