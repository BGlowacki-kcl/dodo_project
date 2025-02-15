import express from 'express';
import dotenv from 'dotenv';

import userRouter from './routes/user.routes.js';
import jobRoutes from './routes/job.route.js';
import applicationRoute from './routes/application.route.js';
import matcher from './routes/matcher.route.js'
import chat from "./api/chat.api.js";
import { checkRole } from './middlewares/auth.middleware.js';

dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use(express.json());
app.use('/api/job', jobRoutes);
app.use('/api/user', userRouter);
app.use('/api/application', applicationRoute);
app.use('/api/matcher', matcher);

app.post('/api/chat', chat); //add auth middleware

export { app };


