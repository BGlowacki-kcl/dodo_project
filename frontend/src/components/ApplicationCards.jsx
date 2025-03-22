import React from 'react';
import { useNavigate } from 'react-router-dom';

const ApplicationCards = ({ applications }) => {
  const navigate = useNavigate();

  const handleCardClick = (app) => {
    if (app.status === "applying") {
      navigate(`/apply/${app.job._id}`);
    } else {
      navigate(`/user/applications/${app._id}`);
    }
  };

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div 
          key={app._id} 
          className="flex justify-between items-center border p-4 rounded cursor-pointer hover:bg-gray-50"
          onClick={() => handleCardClick(app)}
        >
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