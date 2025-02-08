import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import { getAllJobs, deleteJob } from '../../services/jobService';

function EmployerPosts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ title: '', type: '' });


  const employerId = "abc123"; /// TEMP ID FOR NOW WILL CHANGE!!!

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getAllJobs(employerId); 
        setJobs(data);
      } catch (err) {
        console.error("Error fetching employer's jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [employerId]);

  useEffect(() => {
    if (location.state && location.state.updatedJob) {
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === location.state.updatedJob.id ? { ...job, ...location.state.updatedJob } : job
        )
      );
      navigate('/posts', { replace: true });
    }
  }, [location, navigate]);

  const handleDelete = (id) => async (id) => {
    try {
      await deleteJob(id);
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== id));
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/posts/edit/${id}`);
  };

  const handleCreateNew = () => {
    navigate('/posts/new');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredJobs = jobs.filter(job =>
    (filters.title ? job.title.toLowerCase().includes(filters.title.toLowerCase()) : true) &&
    (filters.type ? job.type === filters.type : true)
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <input
          type="text"
          name="title"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
          placeholder="Filter by job title..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <select
          name="type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">All</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
        </select>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <SearchBar placeholder="Search jobs..." onSearch={(term) => setFilters({ ...filters, title: term })} />
          <button onClick={handleCreateNew} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Create New Post
          </button>
        </div>

        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <p className="text-gray-500">No job posts available.</p>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-medium">{job.title} - {job.type} in {job.location}</h3>
                <p>Applicants: {job.applicants}</p>
                <button onClick={() => handleEdit(job.id)} className="mr-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Edit
                </button>
                <button onClick={() => handleDelete(job.id)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployerPosts;
