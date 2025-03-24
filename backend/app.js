import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/user.router.js';
import jobRoutes from './routes/job.router.js';
import applicationRoutes from './routes/application.router.js';
import matcherRoutes from './routes/matcher.router.js';
import shortlistRoutes from './routes/shortlist.router.js';
import chat from "./api/chat.api.js";
import { checkRole } from './middlewares/auth.middleware.js';
import assessmentRoutes from "./routes/assessment.router.js"
import emailRouter from "./routes/email.router.js"

/**
 * Express application configuration
 * Main server setup with middleware and route registration
 * Loads environment variables and initializes API endpoints
 */

// Load environment variables
dotenv.config();

/**
 * Initialize Express application
 * @type {express.Application}
 */
const app = express();

/**
 * Root endpoint for server health check
 * @route GET /
 * @access Public
 */
app.get('/', (req, res) => {
    res.send('Server is ready');
});

/**
 * Global middleware setup
 * Enables CORS for cross-origin requests
 * Parses JSON request bodies
 */
app.use(cors());
app.use(express.json());

/**
 * API route registrations
 * Each module handles a specific domain of functionality
 */
app.use('/api/job', jobRoutes);
app.use('/api/user', userRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/matcher', matcherRoutes);
app.use('/api/shortlist', shortlistRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/email', emailRouter);

/**
 * AI chat endpoint for resume parsing
 * @route POST /api/chat
 * @access Public (should add authentication middleware)
 */
app.post('/api/chat', chat); //add auth middleware

export { app };


