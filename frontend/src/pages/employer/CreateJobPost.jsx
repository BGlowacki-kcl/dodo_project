import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../services/job.service';
import EmployerSideBar from "../../components/EmployerSideBar";
import { assessmentService } from '../../services/assessment.service';
import { userService } from "../../services/user.service";  

function CreateJobPost() {
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
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
    assessments: [],
    deadline:'',
    questions: [], 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {

      const loadTasks = async () => {
        try {
          const taskData = await assessmentService.getAllTasks();
          console.log(taskData);
          setTasks(taskData);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };
  
      
    const fetchUserId = async () => {
      try {
        const userId = await userService.getUserId();
        setJobData(prev => ({ ...prev, postedBy: userId }));
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch user data');
      }
    };
    loadTasks();
    fetchUserId();
  }, []);

  const handleChange = (e) => {   
    const { name, value } = e.target;
    setJobData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAssessmentChange = (taskId) => {
    setJobData(prevData => {
      const newAssessments = prevData.assessments.includes(taskId)
        ? prevData.assessments.filter(id => id !== taskId)
        : [...prevData.assessments, taskId];
      return { ...prevData, assessments: newAssessments };
    });
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

  const handleQuestionChange = (index, value) => {
    setJobData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[index] = { questionText: value };
      return { ...prevData, questions: updatedQuestions };
    });
  };

  const handleAddQuestion = () => {
    setJobData((prevData) => ({
      ...prevData,
      questions: [...prevData.questions, { questionText: "" }],
    }));
  };

  const handleRemoveQuestion = (index) => {
    setJobData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions.splice(index, 1);
      return { ...prevData, questions: updatedQuestions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const missingFields = [];
      if (!jobData.title) missingFields.push("Title");
      if (!jobData.description) missingFields.push("Description");
      if (!jobData.location) missingFields.push("Location");
      if (!jobData.company) missingFields.push("Company");
      if (!jobData.employmentType) missingFields.push("Employment Type");
      if (!jobData.deadline) missingFields.push("Application Deadline");
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.join(', ')}`);
      }

      console.log(jobData);

      await createJob(jobData);
      navigate('/employer/posts');
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

        <div className="max-w-3xl">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rest of your form fields remain the same */}
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
                  value={jobData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]} // This prevents selecting past dates
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assessments (check no for no assessment)</label>
                  <div className="mt-2 space-y-2">
                    {tasks.map((task, index) => (
                      <label key={task.id || index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={task.id}
                          
                          onChange={() => handleAssessmentChange(task.id)}
                        />
                        <span>{task.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Questions</label>
                {jobData.questions.map((question, index) => (
                  <div key={index} className="mb-4">
                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder="Enter question text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="mt-2 text-red-600 hover:underline"
                    >
                      Remove Question
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Question
                </button>
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
  );
}

export default CreateJobPost;
