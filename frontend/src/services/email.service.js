/**
 * Email Service
 * Handles email-related API interactions
 */
import { makeApiRequest, handleApiError } from './helper';

/**
 * Sends an email through the API
 * @param {Object} emailData - Data needed to send the email
 * @returns {Promise<Object>} - Server response with confirmation
 * @throws {Error} If the API request fails
 */
const sendEmail = async (emailData) => {
  try {
    return await makeApiRequest('/api/email', 'POST', emailData);
  } catch (error) {
    throw handleApiError(error, 'Failed to send email');
  }
};

export default sendEmail;