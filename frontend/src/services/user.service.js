/**
 * User Service
 * Handles all API interactions related to user management
 */
import { makeApiRequest } from "./helper.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = `${BASE_URL}/user`;

/**
 * User service with public methods for user-related operations
 */
export const userService = {

  /**
   * Updates the current user's profile information
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user data
   */
  async updateUser(userData) {
    try {
      const result = await makeApiRequest(`${API_BASE_URL}/`, 'PUT', userData);
      return typeof result === 'object' && result !== null ? (result.data || result) : result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves the current user's profile
   * @returns {Promise<Object>} - User profile data
   */
  async getUserProfile() {
    try {
      const result = await makeApiRequest(`${API_BASE_URL}/`, 'GET');
      return typeof result === 'object' && result !== null ? (result.data || result) : result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves the current user's role
   * @returns {Promise<string>} - User role
   */
  async getUserRole() {
    try {
      if (!sessionStorage.getItem("token")) {
        return "unLogged";
      }
      const result = await makeApiRequest(`${API_BASE_URL}/role`, 'GET');
      return typeof result === 'object' && result !== null ? (result.data || result) : result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves the current user's ID
   * @returns {Promise<string>} - User ID
   */
  async getUserId() {
    try {
      const userData = await makeApiRequest(`${API_BASE_URL}/`, 'GET');
      return userData._id;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves a user by their ID
   * @param {string} userId - User ID to fetch
   * @returns {Promise<Object>} - User data
   */
  async getUserById(userId) {
    try {
      return await makeApiRequest(`${API_BASE_URL}/ById?userId=${userId}`, 'GET');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Creates a basic user with minimal information
   * @param {Object} userData - Basic user data
   * @returns {Promise<Object>} - Created user data
   */
  async createBasicUser(userData) {
    try {
      return await makeApiRequest(`${API_BASE_URL}/basic`, 'POST', userData);
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Verifies a user has the expected role
 * @param {string} email - User email
 * @param {string} expectedRole - Role to verify
 * @returns {Promise<boolean>} - True if role matches, false otherwise
 */
export async function verifyUserRole(email, expectedRole) {
  try {
    const result = await makeApiRequest(`${BASE_URL}/user/role?email=${email}`, 'GET');
    const role = typeof result === 'object' && result !== null ? (result.data || result) : result;
    return role === expectedRole;
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if user profile is completed and handles navigation
 * @param {Function} navigate - Navigation function
 * @returns {Promise<void>}
 */
export async function checkProfileCompletion(navigate) {
  try {
    const data = await makeApiRequest(`${BASE_URL}/user/completed`, 'GET');
    const userRole = sessionStorage.getItem('role');
    if (!data && userRole === 'jobSeeker') {
      navigate('/addDetails');
      return;
    }

    navigate('/');
  } catch (error) {
    navigate('/addDetails');
  }
};
