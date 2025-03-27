/**
 * Shortlist Service
 * Handles all API interactions related to job shortlisting functionality
 */
import { makeApiRequest } from "./helper.js";

const SHORTLIST_ENDPOINT = '/api/shortlist';

/**
 * Retrieves a user's job shortlist
 * @returns {Promise<Object>} - User's shortlisted jobs
 */
export async function getShortlist() {
  try {
    return await makeApiRequest(`${SHORTLIST_ENDPOINT}/jobs`, 'GET');
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves a user's job shortlist
 * @returns {Promise<Object>} - User's shortlisted jobs
 */
export async function createShortlist() {
    try {
      return await makeApiRequest(`${SHORTLIST_ENDPOINT}/create`, 'POST');
    } catch (error) {
      throw error;
    }
  }

/**
 * Adds a job to a user's shortlist
 * @param {string} jobId - Job ID to add to shortlist
 * @returns {Promise<Object>} - Updated shortlist data
 */
export async function addJobToShortlist(jobId) {
  try {
    return await makeApiRequest(`${SHORTLIST_ENDPOINT}/addjob?jobid=${jobId}`, 'PUT', { jobId });
  } catch (error) {
    throw error;
  }
}

/**
 * Removes a job from a user's shortlist
 * @param {string} jobId - Job ID to remove from shortlist
 * @returns {Promise<Object>} - Updated shortlist data
 */
export async function removeJobFromShortlist(jobId) {
  try {
    return await makeApiRequest(`${SHORTLIST_ENDPOINT}/removejob?jobid=${jobId}`, 'PUT');
  } catch (error) {
    throw error;
  }
}