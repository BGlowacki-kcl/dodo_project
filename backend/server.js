import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRouter from './routes/user.routes.js';
import jobRoutes from './routes/job.route.js';
import chat from "./api/chat.api.js";

dotenv.config();
const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use(express.json());
app.use('/api/job', jobRoutes);
app.use('/api/user', userRouter);
app.post('/api/chat', chat);

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on: http://localhost:${port}`);
});
