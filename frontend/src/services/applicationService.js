/**
 * Application Service
 * Handles all API interactions related to application management
 */
import { checkTokenExpiration } from "./auth.service.js";

/**
 * Base API request handler with common configuration
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} [body] - Request body (optional)
 * @returns {Promise<Object>} - API response data
 * @throws {Error} - If request fails
 */
async function makeApiRequest(endpoint, method, body = null) {
  const headers = {
    "Content-Type": "application/json",
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
  };

  const requestOptions = {
    method,
    headers,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, requestOptions);
  checkTokenExpiration(response);

  const responseJson = await response.json();
  if (!responseJson.success) {
    throw new Error(responseJson.message || `Failed to ${method.toLowerCase()} ${endpoint}`);
  }

  return responseJson.data;
}

/**
 * Handles API request errors consistently
 * @param {Error} error - The caught error 
 * @param {string} errorMessage - Custom error message
 * @returns {Object} - Standardized error response
 */
function handleApiError(error, errorMessage) {
  if (error.response && error.response.status === 403) {
    return { status: 403, message: "You are not authorized to perform this action" };
  }
  return { status: 500, message: errorMessage };
}

/**
 * Retrieves all applications for the current user
 * @returns {Promise<Array>} - List of all user applications
 */
export async function getAllUserApplications() {
  try {
    return await makeApiRequest('/api/application/all', 'GET');
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves an application by its ID
 * @param {string} appId - Application ID
 * @returns {Promise<Object>} - Application details
 */
export async function getApplicationById(appId) {
  try {
    return await makeApiRequest(`/api/application/byId?id=${appId}`, 'GET');
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves all applicants for a specific job
 * @param {string} jobId - Job ID
 * @returns {Promise<Array|Object>} - List of applicants or error object
 */
export async function getJobApplicants(jobId) {
  try {
    return await makeApiRequest(`/api/application/byJobId?jobId=${jobId}`, 'GET');
  } catch (error) {
    return handleApiError(error, "Failed to fetch applicants");
  }
}

/**
 * Submits a new job application
 * @param {Object} applicationData - Application data
 * @param {string} applicationData.jobId - Job ID
 * @param {string} applicationData.coverLetter - Cover letter text
 * @param {Array} applicationData.answers - Answers to application questions
 * @returns {Promise<Object>} - Created application data
 */
export async function applyToJob({ jobId, coverLetter, answers }) {
  try {
    return await makeApiRequest('/api/application/apply', 'POST', {
      jobId,
      coverLetter,
      answers,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Withdraws an existing application
 * @param {string} appId - Application ID
 * @returns {Promise<string>} - Success message
 */
export async function withdrawApplication(appId) {
  try {
    return await makeApiRequest(`/api/application/withdraw?id=${appId}`, 'DELETE');
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves dashboard data for the current user
 * @returns {Promise<Object>} - Dashboard statistics and data
 */
export async function getDashboardData() {
  try {
    return await makeApiRequest('/api/application/dashboard', 'GET');
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves assessment deadline for an application
 * @param {string} appId - Application ID
 * @returns {Promise<Object>} - Deadline information
 */
export async function getAssessmentDeadline(appId) {
  try {
    return await makeApiRequest(`/api/application/deadline?id=${appId}`, 'GET');
  } catch (error) {
    throw error;
  }
}

/**
 * Sets deadline for the code assessment submission
 * @param {string} appId - Application ID
 * @param {string} deadline - Deadline date
 * @returns {Promise<Object>} - Updated deadline information
 */
export async function setAssessmentDeadline(appId, deadline) {
  try {
    return await makeApiRequest(`/api/application/deadline?id=${appId}`, 'PUT', { deadline });
  } catch (error) {
    throw error;
  }
}

/**
 * Updates application status (approve or reject)
 * @param {string} appId - Application ID
 * @param {boolean} reject - Whether to reject the application
 * @returns {Promise<Object>} - Updated application data
 */
export async function updateStatus(appId, reject) {
  try {
    const queryParams = reject ? `?id=${appId}&reject=true` : `?id=${appId}`;
    return await makeApiRequest(`/api/application/status${queryParams}`, 'PUT');
  } catch (error) {
    throw error;
  }
}

/**
 * Saves application draft
 * @param {Object} applicationData - Application data
 * @param {string} applicationData.applicationId - Application ID
 * @param {string} applicationData.jobId - Job ID
 * @param {string} applicationData.coverLetter - Cover letter text
 * @param {Array} applicationData.answers - Answers to application questions
 * @returns {Promise<Object>} - Saved application data
 */
export async function saveApplication({ applicationId, jobId, coverLetter, answers }) {
  try {
    return await makeApiRequest('/api/application/save', 'PUT', {
      applicationId,
      jobId,
      coverLetter,
      answers,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Submits a drafted application
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} - Submitted application data
 */
export async function submitApplication(applicationId) {
  try {
    return await makeApiRequest('/api/application/submit', 'PUT', { applicationId });
  } catch (error) {
    throw error;
  }
}