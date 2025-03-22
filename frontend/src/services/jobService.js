/**
 * Job Service
 * Handles all API interactions related to job management
 */
import { checkTokenExpiration } from "./auth.service.js";

/**
 * API base URL for job endpoints
 * @constant {string}
 */
const API_BASE_URL = "/api/job";

/**
 * Gets authentication headers for API requests
 * @returns {Object} - Headers with authorization token
 */
function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
  };
}

/**
 * Makes an API request with error handling
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} [body] - Request body (optional)
 * @param {string} errorMessage - Custom error message
 * @returns {Promise<Object>} - API response data
 * @throws {Error} - If request fails
 */
async function makeApiRequest(endpoint, method, body = null, errorMessage) {
  try {
    const requestOptions = {
      method,
      headers: getAuthHeaders(),
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, requestOptions);
    checkTokenExpiration(response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves all jobs
 * @returns {Promise<Array>} - List of all jobs
 */
export async function getAllJobs() {
  return await makeApiRequest(
    `${API_BASE_URL}`,
    "GET",
    null,
    "Failed to fetch all jobs"
  );
}

/**
 * Retrieves a job by ID
 * @param {string} id - Job ID
 * @returns {Promise<Object>} - Job details
 */
export async function getJobById(id) {
  return await makeApiRequest(
    `${API_BASE_URL}/${id}`,
    "GET",
    null,
    `Failed to fetch job with id ${id}`
  );
}

/**
 * Creates a new job
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} - Created job data
 */
export async function createJob(jobData) {
  return await makeApiRequest(
    `${API_BASE_URL}/create`,
    "POST",
    jobData,
    "Failed to create job"
  );
}

/**
 * Updates an existing job
 * @param {string} id - Job ID
 * @param {Object} jobData - Updated job data
 * @returns {Promise<Object>} - Updated job data
 */
export async function updateJob(id, jobData) {
  return await makeApiRequest(
    `${API_BASE_URL}/${id}`,
    "PUT",
    jobData,
    `Failed to update job with id ${id}`
  );
}

/**
 * Deletes a job
 * @param {string} id - Job ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export async function deleteJob(id) {
  return await makeApiRequest(
    `${API_BASE_URL}/${id}`,
    "DELETE",
    null,
    `Failed to delete job with id ${id}`
  );
}

/**
 * Gets job count by type
 * @param {string} jobType - Job type
 * @returns {Promise<number>} - Count of jobs
 */
export async function getJobCountByType(jobType) {
  const data = await makeApiRequest(
    `${API_BASE_URL}/count/type?type=${jobType}`,
    "GET",
    null,
    `Failed to get job count for type: ${jobType}`
  );
  return data.count;
}

/**
 * Gets all job roles
 * @returns {Promise<Array>} - List of job roles
 */
export async function getAllJobRoles() {
  return await makeApiRequest(
    `${API_BASE_URL}/roles`,
    "GET",
    null,
    "Failed to get all job roles"
  );
}

/**
 * Gets all job locations
 * @returns {Promise<Array>} - List of job locations
 */
export async function getAllJobLocations() {
  return await makeApiRequest(
    `${API_BASE_URL}/locations`,
    "GET",
    null,
    "Failed to get all job locations"
  );
}

/**
 * Gets all job types
 * @returns {Promise<Array>} - List of job types
 */
export async function getAllJobTypes() {
  return await makeApiRequest(
    `${API_BASE_URL}/employmentType`,
    "GET",
    null,
    "Failed to get all job types"
  );
}

/**
 * Builds query parameters for job filtering
 * @param {Object} filters - Filter criteria
 * @returns {string} - URL query string
 */
function buildFilterQueryParams(filters) {
  const queryParams = new URLSearchParams();
  
  if (filters.jobType) {
    filters.jobType.forEach((type) => queryParams.append("jobType", type));
  }
  
  if (filters.location) {
    filters.location.forEach((loc) => queryParams.append("location", loc));
  }
  
  if (filters.role) {
    filters.role.forEach((role) => queryParams.append("role", role));
  }
  
  return queryParams.toString();
}

/**
 * Gets jobs filtered by criteria
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} - Filtered job list
 */
export async function getFilteredJobs(filters) {
  const queryString = buildFilterQueryParams(filters);
  const url = `${API_BASE_URL}/search?${queryString}`;
  
  return await makeApiRequest(
    url,
    "GET",
    null,
    "Failed to get filtered jobs"
  );
}

/**
 * Gets jobs posted by the current employer
 * @returns {Promise<Array>} - List of employer jobs
 */
export async function getJobsByEmployer() {
  return await makeApiRequest(
    `${API_BASE_URL}/employer`,
    "GET",
    null,
    "Failed to fetch jobs by employer"
  );
}

/**
 * Gets applicants for a specific job
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} - List of applicants
 * @throws {Error} - If jobId is missing
 */
export async function getApplicantsByJobId(jobId) {
  if (!jobId) {
    throw new Error("Job ID is required");
  }
  
  const result = await makeApiRequest(
    `${API_BASE_URL}/applicants?jobId=${jobId}`,
    "GET",
    null,
    "Failed to fetch applicants"
  );
  
  return result.data || [];
}

/**
 * Gets questions for a job posting
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} - List of job questions
 */
export async function getJobQuestionsById(jobId) {
  return await makeApiRequest(
    `${API_BASE_URL}/questions?jobId=${jobId}`,
    "GET",
    null,
    "Failed to fetch job questions"
  );
}