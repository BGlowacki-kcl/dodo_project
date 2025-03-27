/**
 * Email Service
 * Handles email-related API interactions
 */
import { makeApiRequest, handleApiError } from './helper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Sends an email through the API
 * @param {Object} emailData - Data needed to send the email
 * @returns {Promise<Object>} - Server response with confirmation
 * @throws {Error} If the API request fails
 */
const sendEmail = async (emailData) => {
  try {
    return await makeApiRequest(`${BASE_URL}/email`, 'POST', emailData, false);
  } catch (error) {
    throw handleApiError(error, 'Failed to send email');
  }
};

export async function someEmailServiceMethod() {
  try {
    const result = await makeApiRequest('/email/endpoint', 'GET');
    return Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    throw error;
  }
}

export default sendEmail;