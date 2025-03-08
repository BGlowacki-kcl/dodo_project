import { checkTokenExpiration } from './auth.service';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});
 
const getAuthToken = () => {
  return sessionStorage.getItem('token');  
};
 
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
); 

/// change to api.---- for header
export const getAllJobs = async () => {
  const response = await axios.get(`/api/job`); 
  checkTokenExpiration(response);
  return response.data;
};

export const getJobById = async (id) => {
  const response = await axios.get(`/api/job/${id}`);
  checkTokenExpiration(response);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post(`/job/create`, jobData);
  checkTokenExpiration(response);
  return response.data; 
};

export const updateJob = async (id, jobData) => {
  const response = await axios.put(`/api/job/${id}`, jobData);
  checkTokenExpiration(response);
  return response.data; 
};

export const deleteJob = async (id) => {
  const response = await axios.delete(`/api/job/${id}`);
  checkTokenExpiration(response);
  return response.data;
};
