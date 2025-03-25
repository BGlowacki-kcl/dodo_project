import { app } from "./app.js";
import { connectDB } from './config/db.js';

/**
 * Server initialization
 * Starts the Express server and establishes database connection
 * Configures port from environment variables or uses default
 */

/**
 * Server port configuration
 * Uses environment variable if available or fallback to default
 * @type {Number}
 */
const port = process.env.PORT || 5001;

/**
 * Start HTTP server and database connection
 * Listens on configured port and connects to MongoDB
 */
app.listen(port, () => {
    connectDB();
    console.log(`Server is running on: http://localhost:${port}`);
});