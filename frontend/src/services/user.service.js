/**
 * User Service
 * Handles all API interactions related to user management
 */
import { makeApiRequest } from "./helper.js";

const API_BASE_URL = "/api/user";

/**
 * Updates the current user's profile information
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} - Updated user data
 */
export async function updateUser(userData) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/`, 'PUT', userData);
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves the current user's profile
 * @returns {Promise<Object>} - User profile data
 */
export async function getUserProfile() {
  try {
    return await makeApiRequest(`${API_BASE_URL}/`, 'GET');
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves the current user's role
 * @returns {Promise<string>} - User role
 */
export async function getUserRole() {
  try {
    if (!sessionStorage.getItem("token")) {
      return "unLogged";
    }
    return await makeApiRequest(`${API_BASE_URL}/role`, 'GET');
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves the current user's ID
 * @returns {Promise<string>} - User ID
 */
export async function getUserId() {
  try {
    const userData = await makeApiRequest(`${API_BASE_URL}/`, 'GET');
    return userData._id;
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves a user by their ID
 * @param {string} userId - User ID to fetch
 * @returns {Promise<Object>} - User data
 */
export async function getUserById(userId) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/ById?userId=${userId}`, 'GET');
  } catch (error) {
    throw error;
  }
}

/**
 * Checks if user profile is completed and handles navigation
 * @param {Function} navigate - Navigation function
 * @returns {Promise<void>}
 */
export async function checkProfileCompletion(navigate) {
  try {
    const data = await makeApiRequest('/api/user/completed', 'GET');
    const userRole = sessionStorage.getItem('role');
    
    if (data.redirect && userRole === 'jobSeeker') {
      navigate(data.redirect);
      return;
    }
    
    navigate('/');
  } catch (error) {
    navigate('/addDetails');
  }
}

/**
 * Creates a basic user with minimal information
 * @param {Object} userData - Basic user data
 * @returns {Promise<Object>} - Created user data
 */
export async function createBasicUser(userData) {
  try {
    return await makeApiRequest(`${API_BASE_URL}/basic`, 'POST', userData);
  } catch (error) {
    throw error;
  }
}

/**
 * Verifies a user has the expected role
 * @param {string} email - User email
 * @param {string} expectedRole - Role to verify
 * @returns {Promise<boolean>} - True if role matches, false otherwise
 */
export async function verifyUserRole(email, expectedRole) {
  try {
    const role = await makeApiRequest(`/api/user/role?email=${email}`, 'GET');
    return role === expectedRole;
  } catch (error) {
    throw error;
  }
}