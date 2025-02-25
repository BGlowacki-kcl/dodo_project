import React from 'react';

const ApplicationCards = ({ applications }) => {
  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app._id} className="flex justify-between items-center border p-4 rounded">
          <div>
            <div className="font-bold">
              {app.job?.company || app.job?.title}
            </div>
            <div className="text-sm">
              {new Date(app.submittedAt).toLocaleString("en-GB")}
            </div>
          </div>
          <div className="flex items-center">
            <span>{app.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationCards;