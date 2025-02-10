import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJobById, updateJob } from '../../services/jobService';

function EditJobPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    type: 'Full-time',
    location: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    // const storedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    // const jobToEdit = storedJobs.find(job => job.id === parseInt(id));
    
    // if (jobToEdit) {
    //   setJobData(jobToEdit);
    // } else {
    //   setError("Job not found.");
    // }

    /// JOB FETCH FROM BACKEND
    async function fetchJob() {
      try {
        if (!id) {
          setError("Missing job ID in URL.");
          return;
        }
        const job = await getJobById(id);
        setJobData({
          title: job.title,
          description: job.description,
          type: job.employmentType?.[0] || 'Full-time',
          location: job.location
        });
      } catch (err) {
        setError('Could not fetch job from server.');
      }
    }
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = async (e) => { //made into async (check if problematic)
    e.preventDefault();

    if (!jobData.title || !jobData.description || !jobData.location) {
      setError("All fields are required.");
      return;
    }

    // const storedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    // const updatedJobs = storedJobs.map(job => 
    //   job.id === parseInt(id) ? { ...job, ...jobData } : job
    // );

    // localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    
    // navigate('/posts', { state: { updatedJob: jobData } }); 
    try {
      const updatedJob = {
        ...jobData,
        employmentType: [jobData.type]
      };
      await updateJob(id, updatedJob);
      navigate('/posts', { state: { updatedJob: updatedJob } });
    } catch (err) {
      setError('Error updating job');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-lg font-bold mb-4">Edit Job Post</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
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

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditJobPost;
