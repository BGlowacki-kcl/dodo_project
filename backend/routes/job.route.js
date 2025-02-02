const express = require('express');
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    applyToJob
} = require('../controllers/jobController');

const router = express.Router();

// Create a job post
router.post('/', createJob);

// Get all job posts
router.get('/', getJobs);

// Get a job post by ID
router.get('/:id', getJobById);

// Update a job post
router.put('/:id', updateJob);

// Delete a job post
router.delete('/:id', deleteJob);

// Apply to a job post
router.post('/:id/apply', applyToJob);

module.exports = router;
