/**
 * Matcher Service
 * Handles job recommendation functionality
 */
import { getAuth } from "firebase/auth";
import { handleApiError } from "./helper.js";

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
    
    const response = await fetch("http://localhost:5000/api/matcher/recommend-jobs", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch recommended jobs");
    }
    
    const data = await response.json();
    return data.recommendedJobs;
  } catch (error) {
    return handleApiError(error, "Failed to get job recommendations");
  }
}