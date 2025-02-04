import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.route.js';
import jobRoutes from './routes/job.route.js';

dotenv.config();
const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use(express.json());
app.use('/api/auth', authRoutes); // e.g. http://localhost:5000/api/auth/signup
app.use('/api/job', jobRoutes);

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on: http://localhost:${port}`);
});
