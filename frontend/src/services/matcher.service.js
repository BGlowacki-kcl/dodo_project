/**
 * Matcher Service
 * Handles job recommendation functionality
 */
import { getAuth } from "firebase/auth";
import { handleApiError, makeApiRequest } from "./helper.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Gets the current user's Firebase authentication token
 * @returns {Promise<string|null>} - User's auth token or null if not authenticated
 */
async function getUserToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  return await user.getIdToken();
}

/**
 * Retrieves recommended jobs for the current user
 * @returns {Promise<Array>} - List of recommended jobs
 * @throws {Error} - If user is not authenticated or API call fails
 */
export async function getRecommendedJobs() {
  try {
    const token = await getUserToken();
    
    if (!token) {
      throw new Error("User is not authenticated.");
    }
    
    const result = await makeApiRequest(`${BASE_URL}/matcher/recommend-jobs`, 'GET');
    return Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    return handleApiError(error, "Failed to get job recommendations");
  }
}