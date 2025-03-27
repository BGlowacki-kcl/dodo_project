import { app } from "./app.js";
import { connectDB } from './config/db.js';
import { warmUpHuggingFace } from './controllers/matcher.controller.js';

const port = process.env.PORT || 5000;

// Async startup routine
const startServer = async () => {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`Server is running on: http://localhost:${port}`);
        });

        // warmUpHuggingFace().catch(error => {
        //     console.error('Hugging Face warm-up failed (non-critical):', error.message);
        // });

    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();