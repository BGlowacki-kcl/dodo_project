import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../services/jobService';

function CreateJobPost() {
  const [jobData, setJobData] = useState({
    company: '',
    title: '',
    description: '',
    type: 'Full-time',
    location: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userId = "67aa6f2ce7d1ee03803ef428"; //////////////////////////////////////// CONSTANT FOR NOW WILL CHANGE!!!

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if any field is missing
      const missingFields = [];
      if (!jobData.title) missingFields.push("Title");
      if (!jobData.description) missingFields.push("Description");
      if (!jobData.location) missingFields.push("Location");
      if (!jobData.company) missingFields.push("Company");

      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.join(', ')}`);
      }


      const newJob = {
        ...jobData,
        postedBy: userId, 
      };

      //await new Promise((resolve) => setTimeout(resolve, 1000)); not sure if needed before, left commented
      await createJob(newJob);

      // const storedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
      // const updatedJobs = [...storedJobs, { id: storedJobs.length + 1, ...jobData, applicants: 0 }];
      // localStorage.setItem('jobs', JSON.stringify(updatedJobs));

      navigate('/posts');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-lg font-bold mb-4">Create New Job Post</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            name="company"
            value={jobData.company}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={jobData.title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={jobData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Type</label>
          <select
            name="type"
            value={jobData.type}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={jobData.location}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        <button 
          type="submit" 
          className={`px-4 py-2 text-white rounded-md ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Job'}
        </button>
      </form>
    </div>
  );
}

export default CreateJobPost;
