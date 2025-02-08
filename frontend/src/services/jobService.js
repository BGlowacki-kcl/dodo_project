
import axios from 'axios';


/// all jobs from this employer
export const getAllJobs = async (employerId) => {
  const url = employerId ? `/api/job?postedBy=${employerId}` : `/api/job`;
  const response = await axios.get(url);
  return response.data; 
};

export const getJobById = async (id) => {
  const response = await axios.get(`/api/job/${id}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await axios.post(`/api/job`, jobData);
  return response.data; 
};

export const updateJob = async (id, jobData) => {
  const response = await axios.put(`/api/job/${id}`, jobData);
  return response.data; 
};

export const deleteJob = async (id) => {
  const response = await axios.delete(`/api/job/${id}`);
  return response.data;
};
