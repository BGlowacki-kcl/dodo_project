import express from 'express';
import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobCountByType,
    getAllJobRoles,
    getAllJobLocations,
    getAllJobTypes,
    getFilteredJobs,
    getJobsByEmployer,
    getAllCompanies,
    getJobQuestionsById
} from '../controllers/job.controller.js';
import { checkRole } from '../middlewares/auth.middleware.js';

/**
 * Job routes configuration
 * Handles all HTTP endpoints related to job postings
 * Includes routes for creating, retrieving, updating and deleting jobs
 */
const router = express.Router();

/**
 * Get job count statistics by type
 * @route GET /api/job/count/type
 * @access Public
 */
router.get('/count/type', getJobCountByType);

/**
 * Get all available job roles from current listings
 * @route GET /api/job/roles
 * @access Public
 */
router.get('/roles', getAllJobRoles);

/**
 * Get all available job locations from current listings
 * @route GET /api/job/locations
 * @access Public
 */
router.get('/locations', getAllJobLocations);

/**
 * Get all available employment types from current listings
 * @route GET /api/job/employmentType
 * @access Public
 */
router.get('/employmentType', getAllJobTypes);

/**
 * Get all companies with active job listings
 * @route GET /api/job/company
 * @access Public
 */
router.get('/company', getAllCompanies);

/**
 * Search and filter jobs based on criteria
 * @route GET /api/job/search
 * @access Public
 */
router.get('/search', getFilteredJobs);

/**
 * Get questions for a specific job posting
 * @route GET /api/job/questions
 * @access Public
 */
router.get('/questions', getJobQuestionsById);

/**
 * Create a new job posting
 * @route POST /api/job/create
 * @access Private - employer only
 */
router.post('/create', checkRole(["employer"]), createJob);

/**
 * Get all job postings
 * @route GET /api/job
 * @access Public
 */
router.get('/', getJobs);

/**
 * Get all jobs posted by current employer
 * @route GET /api/job/employer
 * @access Private - employer only
 */
router.get('/employer', checkRole(['employer']), getJobsByEmployer);

/**
 * Get specific job posting by ID
 * @route GET /api/job/:id
 * @access Public
 */
router.get('/:id', getJobById);

/**
 * Update existing job posting
 * @route PUT /api/job/:id
 * @access Private - employer only
 */
router.put('/:id', checkRole(['employer']), updateJob);

/**
 * Delete existing job posting
 * @route DELETE /api/job/:id
 * @access Private - employer only
 */
router.delete('/:id', checkRole(['employer']),  deleteJob);

export default router;
