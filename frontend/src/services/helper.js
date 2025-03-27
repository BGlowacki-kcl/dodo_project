import { checkTokenExpiration } from "./auth.service";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Base API request handler with common configuration
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} [body] - Request body (optional)
 * @returns {Promise<Object>} - API response data
 * @throws {Error} - If request fails
 */
export async function makeApiRequest(endpoint, method, body = null) {
  // Ensure endpoint starts with BASE_URL
  const fullEndpoint = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const requestOptions = {
      method,
      headers: getRequestHeaders(),
  };

  if (body) {
      requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(fullEndpoint, requestOptions);
  
  // Clone the response before checking token expiration
  await checkTokenExpiration(response.clone());
  
  const responseJson = await response.json();
  if (!responseJson.success) {

      throw new Error(responseJson.message || `Failed to ${method.toLowerCase()} ${endpoint}`);
  }
  
  return responseJson.data;
}

/**
 * Common request headers with authorization
 * @returns {Object} - Headers object with Content-Type and Authorization
 */
function getRequestHeaders() {
    return {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
    };
  }
  

/**
 * Handles API request errors consistently
 * @param {Error} error - The caught error 
 * @param {string} errorMessage - Custom error message
 * @returns {Object} - Standardized error response
 */
export function handleApiError(error, errorMessage) {
    if (error.response && error.response.status === 403) {
      return { status: 403, message: "You are not authorized to perform this action" };
    }
    return { status: 500, message: errorMessage };
}