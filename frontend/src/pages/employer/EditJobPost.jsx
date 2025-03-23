import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJobById, updateJob } from '../../services/job.service';
import EmployerSideBar from "../../components/EmployerSideBar";

function EditJobPost() {
  const { jobId } = useParams();
  const navigate = useNavigate();
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
    deadline: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log("Fetching job with id:", jobId);
        const response = await fetch(`/api/job/${jobId}`);
        const data = await response.json();
        console.log("Job Data", data);
        setJobData(data);
      } catch (error) {
        console.error("Error fetching job:", error);
        setError("Failed to load job details");
      }
    };
    fetchJob();
  }, [jobId]);

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
    try {
      const response = await fetch(`/api/job/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        throw new Error('Failed to update job');
      }

      navigate('/employer/posts');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <EmployerSideBar />
      <div className="flex-1 p-8 ml-64">
        <h1 className="text-3xl font-bold text-[#1B2A41] mb-6">
          Edit Job Post
        </h1>

        <div className="max-w-3xl">
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
                <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={jobData.deadline ? jobData.deadline.split('T')[0] : ''}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
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
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Placement">Placement</option>
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
                  placeholder="e.g. JavaScript, React, Node.js"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditJobPost;
