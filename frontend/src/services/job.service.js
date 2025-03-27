/**
 * Job Service
 * Handles all API interactions related to job management
 */
import { makeApiRequest } from "./helper.js";

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
 * Retrieves all jobs
 * @returns {Promise<Array>} - List of all jobs
 */
export async function getAllJobs() {
  return await makeApiRequest(
    `${API_BASE_URL}/?deadlineValid=true`,
    "GET"
  );
}

/**
 * Retrieves a job by ID
 * @param {string} id - Job ID
 * @returns {Promise<Object>} - Job details
 */
export async function getJobById(id) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/${id}`, "GET");
  } catch (error) {
    throw error;
  }
}

/**
 * Creates a new job
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} - Created job data
 */
export async function createJob(jobData) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/create`, "POST", jobData);
  } catch (error) {
    throw error;
  }
}

/**
 * Updates an existing job
 * @param {string} id - Job ID
 * @param {Object} jobData - Updated job data
 * @returns {Promise<Object>} - Updated job data
 */
export async function updateJob(id, jobData) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/${id}`, "PUT", jobData);
  } catch (error) {
    throw error;
  }
}

/**
 * Deletes a job
 * @param {string} id - Job ID
 * @returns {Promise<Object>} - Deletion confirmation
 */
export async function deleteJob(id) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/${id}`, "DELETE");
  } catch (error) {
    throw error;
  }
}

/**
 * Gets job count by type
 * @param {string} jobType - Job type
 * @returns {Promise<number>} - Count of jobs
 */
export async function getJobCountByType(jobType) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/count/type?type=${jobType}`, "GET");
  } catch (error) {
    throw error;
  }
}

/**
 * Gets all job roles
 * @returns {Promise<Array>} - List of job roles
 */
export async function getAllJobRoles() {
  try {
    return await makeApiRequest(`${API_BASE_URL}/roles`, "GET");
  } catch (error) {
    throw error;
  }
}

/**
 * Gets all job locations
 * @returns {Promise<Array>} - List of job locations
 */
export async function getAllJobLocations() {
  try {
    return await makeApiRequest(`${API_BASE_URL}/locations`, "GET");
  } catch (error) {
    throw error;
  }
}

/**
 * Gets all job types
 * @returns {Promise<Array>} - List of job types
 */
export async function getAllJobTypes() {
  try {
    return await makeApiRequest(`${API_BASE_URL}/employmentType`, "GET");
  } catch (error) {
    throw error;
  }
}

/**
 * Gets all companies
 * @returns {Promise<Array>} - List of companies
 */
export async function getAllCompanies() {
  try {
    return await makeApiRequest(`${API_BASE_URL}/company`, "GET");
  } catch (error) {
    throw error;
  }
}

/**
 * Builds query parameters for job filtering
 * @param {Object} filters - Filter criteria object
 * @returns {string} - URL query string
 */
function buildFilterQueryParams(filters) {
  const queryParams = new URLSearchParams();
  
  // Handle companies filter
  if (filters.companies && filters.companies.length > 0) {
    filters.companies.forEach((company) => queryParams.append("company", company));
  }
  
  // Handle job types filter
  if (filters.jobTypes && filters.jobTypes.length > 0) {
    filters.jobTypes.forEach((type) => queryParams.append("jobType", type));
  }
  
  // Handle locations filter
  if (filters.locations && filters.locations.length > 0) {
    filters.locations.forEach((location) => queryParams.append("location", location));
  }
  
  // Handle job titles filter
  if (filters.titles && filters.titles.length > 0) {
    filters.titles.forEach((title) => queryParams.append("title", title));
  }
  
  // Handle deadline range filter
  if (filters.deadlineRange) {
    queryParams.append("deadlineRange", filters.deadlineRange);
  }
  
  // Handle salary range filter
  if (filters.salaryRange && filters.salaryRange.length === 2) {
    queryParams.append("salaryMin", filters.salaryRange[0]);
    queryParams.append("salaryMax", filters.salaryRange[1]);
  }
  
  return queryParams.toString();
}

/**
 * Gets jobs filtered by criteria
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} - Filtered job list
 */
export async function getFilteredJobs(filters) {
  try {
    // Log the input filters for debugging
    console.log("Applying filters:", JSON.stringify(filters, null, 2));
    
    // Build the query string
    const queryString = buildFilterQueryParams(filters);
    
    // Log the generated query string
    console.log("Generated query string:", queryString);
    
    // Make the API request with the query parameters
    return await makeApiRequest(`${API_BASE_URL}/search?${queryString}`, "GET");
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching filtered jobs:", error);
    throw error;
  }
}

/**
 * Gets jobs posted by the current employer
 * @returns {Promise<Array>} - List of employer jobs
 */
export async function getJobsByEmployer() {
  try {
    return await makeApiRequest(`${API_BASE_URL}/employer`, "GET");
  } catch (error) {
    throw error;
  }
}

/**
 * Gets applicants for a specific job
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} - List of applicants
 * @throws {Error} - If jobId is missing
 */
export async function getApplicantsByJobId(jobId) {
  try {
    if (!jobId) {
      throw new Error("Job ID is required");
    }
    
    const result = await makeApiRequest(`${API_BASE_URL}/applicants?jobId=${jobId}`, "GET");
    return result.data || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Gets questions for a job posting
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} - List of job questions
 */
export async function getJobQuestionsById(jobId) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/questions?jobId=${jobId}`, "GET");
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches the minimum and maximum salary bounds from the backend
 * @returns {Promise<Object>} - { minSalary, maxSalary }
 */
export async function getSalaryBounds() {
  return await makeApiRequest(
      `${API_BASE_URL}/salary-bounds`,
      "GET",
      null,
      "Failed to fetch salary bounds"
  );
}