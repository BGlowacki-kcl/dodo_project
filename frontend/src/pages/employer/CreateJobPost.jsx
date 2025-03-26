/**
 * CreateJobPost.jsx
 *
 * This component represents the Create Job Post page in the application. It provides:
 * - A form to create a new job post with fields such as title, description, requirements, etc.
 * - Options to add assessments and custom questions for applicants.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../services/job.service.js';
import { assessmentService } from '../../services/assessment.service';
import { userService } from "../../services/user.service";
import WhiteBox from "../../components/WhiteBox";
import { FaTrash } from "react-icons/fa";

function CreateJobPost() {
  // ----------------------------- State Variables -----------------------------
  const [tasks, setTasks] = useState([]);
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salaryRange: { min: 0, max: 0 },
    employmentType: '',
    requirements: [],
    experienceLevel: '',
    assessments: [],
    deadline: '',
    questions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const navigate = useNavigate();

  // ----------------------------- Effects -----------------------------
  /**
   * Effect to fetch tasks and employer details when the component mounts.
   */
  useEffect(() => {
    fetchTasks();
    fetchEmployerDetails();
  }, []);

  // ----------------------------- Data Fetching -----------------------------
  /**
   * Fetches all available tasks for assessments.
   */
  const fetchTasks = async () => {
    try {
      const taskData = await assessmentService.getAllTasks();
      setTasks(taskData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  /**
   * Fetches employer details to prefill the company name.
   */
  const fetchEmployerDetails = async () => {
    try {
      const employerDetails = await userService.getEmployerDetails();
      setJobData((prev) => ({
        ...prev,
        company: employerDetails.companyName || '',
      }));
    } catch (error) {
      console.error('Error fetching employer details:', error);
      setError('Failed to fetch employer details');
    }
  };

  // ----------------------------- Handlers -----------------------------
  /**
   * Handles changes to input fields in the form.
   * @param {Object} e - The event object.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prevData) => ({ ...prevData, [name]: value }));
  };

  /**
   * Handles changes to the salary range fields.
   * @param {string} type - The type of salary field ('min' or 'max').
   * @param {string} value - The new value for the salary field.
   */
  const handleSalaryChange = (type, value) => {
    setJobData((prevData) => ({
      ...prevData,
      salaryRange: { ...prevData.salaryRange, [type]: parseInt(value) },
    }));
  };

  /**
   * Adds a new requirement to the requirements list.
   */
  const handleAddRequirement = () => {
    if (requirementInput.trim() && !jobData.requirements.includes(requirementInput.trim())) {
      setJobData((prevData) => ({
        ...prevData,
        requirements: [...prevData.requirements, requirementInput.trim()],
      }));
      setRequirementInput('');
    }
  };

  /**
   * Removes a requirement from the requirements list.
   * @param {number} index - The index of the requirement to remove.
   */
  const handleRemoveRequirement = (index) => {
    setJobData((prevData) => {
      const updatedRequirements = [...prevData.requirements];
      updatedRequirements.splice(index, 1);
      return { ...prevData, requirements: updatedRequirements };
    });
  };

  /**
   * Toggles the selection of a task for assessments.
   * @param {string} taskId - The ID of the task to toggle.
   */
  const handleAssessmentChange = (taskId) => {
    setJobData((prevData) => {
      const newAssessments = prevData.assessments.includes(taskId)
        ? prevData.assessments.filter((id) => id !== taskId)
        : [...prevData.assessments, taskId];
      return { ...prevData, assessments: newAssessments };
    });
  };

  /**
   * Updates the text of a custom question.
   * @param {number} index - The index of the question to update.
   * @param {string} value - The new question text.
   */
  const handleQuestionChange = (index, value) => {
    setJobData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[index] = { questionText: value };
      return { ...prevData, questions: updatedQuestions };
    });
  };

  /**
   * Adds a new custom question to the questions list.
   */
  const handleAddQuestion = () => {
    setJobData((prevData) => ({
      ...prevData,
      questions: [...prevData.questions, { questionText: '' }],
    }));
  };

  /**
   * Removes a custom question from the questions list.
   * @param {number} index - The index of the question to remove.
   */
  const handleRemoveQuestion = (index) => {
    setJobData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions.splice(index, 1);
      return { ...prevData, questions: updatedQuestions };
    });
  };

  /**
   * Submits the job post form.
   * @param {Object} e - The event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const missingFields = [];
      if (!jobData.title) missingFields.push('Title');
      if (!jobData.description) missingFields.push('Description');
      if (!jobData.location) missingFields.push('Location');
      if (!jobData.company) missingFields.push('Company');
      if (!jobData.employmentType) missingFields.push('Employment Type');
      if (!jobData.deadline) missingFields.push('Application Deadline');

      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.join(', ')}`);
      }

      await createJob(jobData);
      navigate('/employer/posts');
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------- Render -----------------------------
  return (
    <div className="container mx-auto p-4">
      <div className="flex-1 p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-left text-black">Create Job Post</h1>
          <button
            onClick={() => navigate('/employer/posts')}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
        </div>

        {/* Form */}
        <WhiteBox className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Company</label>
              <input
                type="text"
                name="company"
                value={jobData.company}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
                disabled // Make the field read-only
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Requirements</label>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  placeholder="Add a requirement"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {jobData.requirements.map((req, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-800 font-medium flex items-center space-x-2"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={jobData.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Employment Type</label>
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

            {/* Description */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={jobData.description}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium text-gray-700">Minimum Salary</label>
                <input
                  type="number"
                  value={jobData.salaryRange.min}
                  onChange={(e) => handleSalaryChange('min', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Maximum Salary</label>
                <input
                  type="number"
                  value={jobData.salaryRange.max}
                  onChange={(e) => handleSalaryChange('max', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={jobData.location}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Assessments */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Assessments</label>
              <div className="mt-2 space-y-2">
                {tasks.map((task, index) => (
                  <label key={task.id || index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={task.id}
                      onChange={() => handleAssessmentChange(task.id)}
                    />
                    <span className="text-base text-gray-800">{task.title}</span> {/* Updated to text-base */}
                  </label>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Questions</label>
              {jobData.questions.map((question, index) => (
                <div key={index} className="mb-4 flex items-center space-x-4">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    placeholder="Enter question text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Question"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all"
                title="Add Question"
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/employer/posts')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
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
        </WhiteBox>
      </div>
    </div>
  );
}

export default CreateJobPost;