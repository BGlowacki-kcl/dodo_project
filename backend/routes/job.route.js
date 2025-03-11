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
    getJobsByEmployer,
} from '../controllers/job.controller.js';
import { checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/count/type', getJobCountByType);

router.get('/roles', getAllJobRoles);

router.get('/locations', getAllJobLocations);

// Create a job post
router.post('/create', checkRole(["employer"]), createJob);

// Get all job posts
router.get('/', getJobs);

// Get a job post by ID
router.get('/:id', getJobById);

// Update a job post
router.put('/:id', updateJob);


router.get('/employer', checkRole(['employer']), getJobsByEmployer);

// Delete a job post
router.delete('/:id', deleteJob);



export default router;
