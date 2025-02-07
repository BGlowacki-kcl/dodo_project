import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRouter from './routes/user.routes.js';
import jobRoutes from './routes/job.route.js';
import applicationRoute from './routes/application.route.js';

dotenv.config();
const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use(express.json());
app.use('/api/job', jobRoutes);
app.use('/api/user', userRouter);
app.use('/api/application', applicationRoute);

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on: http://localhost:${port}`);
});
