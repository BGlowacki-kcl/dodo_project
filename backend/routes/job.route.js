import express from 'express';

import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
} from '../controllers/job.controller.js';
import { checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create a job post
router.post('/create', checkRole(["employer"]), createJob);

// Get all job posts
router.get('/', getJobs);

// Get a job post by ID
router.get('/:id', getJobById);

// Update a job post
router.put('/:id', updateJob);

// Delete a job post
router.delete('/:id', deleteJob);

export default router;
