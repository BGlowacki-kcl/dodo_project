import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/user.routes.js';
import jobRoutes from './routes/job.route.js';
import applicationRoutes from './routes/application.route.js';
import matcherRoutes from './routes/matcher.route.js';
import shortlistRoutes from './routes/shortlist.route.js';
import chat from "./api/chat.api.js";
import { checkRole } from './middlewares/auth.middleware.js';
import assessmentRoutes from "./routes/assessment.router.js"
import emailRouter from "./routes/email.router.js"

dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use(cors());

app.use(express.json());
app.use('/api/job', jobRoutes);
app.use('/api/user', userRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/matcher', matcherRoutes);
app.use('/api/shortlist', shortlistRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/email', emailRouter)

app.post('/api/chat', chat); //add auth middleware

export { app };


