import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../services/jobService';
import EmployerSideBar from "../../components/EmployerSideBar";

function CreateJobPost() {
  const [jobs, setJobs] = useState([]);
  const [jobData, setJobData] = useState({
  
    title: '',
    company: '',
    description: '',
    location: '',
    salaryRange: {
      min: 0,
      max: 0
    },
    employmentType: '',
    requirements: [],
    experienceLevel: '',
    postedBy: '67aa6f2ce7d1ee03803ef428' // TEMP ID FOR NOW WILL CHANGE!!!
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch existing jobs
    fetch('/api/job')
      .then(response => response.json())
      .then(data => setJobs(data))
      .catch(error => console.error('Error fetching jobs:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSalaryChange = (type, value) => {
    setJobData(prevData => ({
      ...prevData,
      salaryRange: {
        ...prevData.salaryRange,
        [type]: parseInt(value)
      }
    }));
  };

  const handleRequirementsChange = (e) => {
    const requirements = e.target.value.split(',').map(req => req.trim());
    setJobData(prevData => ({
      ...prevData,
      requirements
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
      };

      //await new Promise((resolve) => setTimeout(resolve, 1000)); not sure if needed before, left commented
      await createJob(newJob);

      // const storedJobs = JSON.parse(localStorage.getItem('jobs')) || [];
      // const updatedJobs = [...storedJobs, { id: storedJobs.length + 1, ...jobData, applicants: 0 }];
      // localStorage.setItem('jobs', JSON.stringify(updatedJobs));

      navigate('/posts');
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployerSideBar />

      <div className="flex-1 p-8 ml-64">
        <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">
          Create New Job Post
        </h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Job List Sidebar */}
          <div className="bg-white text-[#1B2A41] p-4 rounded-lg shadow-lg h-96 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Existing Job Posts</h2>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="p-4 rounded-lg bg-[#CCC9DC]"
                >
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <p className="text-sm text-gray-600">{job.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Create Form */}
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={jobData.company}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                  <select
                    name="employmentType"
                    value={jobData.employmentType}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Select Employment Type</option>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={jobData.description}
                    onChange={handleChange}
                    rows="4"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Salary</label>
                    <input
                      type="number"
                      value={jobData.salaryRange.min}
                      onChange={(e) => handleSalaryChange('min', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maximum Salary</label>
                    <input
                      type="number"
                      value={jobData.salaryRange.max}
                      onChange={(e) => handleSalaryChange('max', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Requirements (comma-separated)</label>
                  <input
                    type="text"
                    value={jobData.requirements.join(', ')}
                    onChange={handleRequirementsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="e.g. JavaScript, React, 3 years experience"
                  />
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

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/employer/posts')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 text-white rounded-md ${
                      loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateJobPost;
