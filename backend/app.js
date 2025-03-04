import express from 'express';
import dotenv from 'dotenv';

import userRoutes from './routes/user.routes.js';
import jobRoutes from './routes/job.route.js';
import applicationRoutes from './routes/application.route.js';
import matcherRoutes from './routes/matcher.route.js';
import shortlistRoutes from './routes/shortlist.route.js';
import chat from "./api/chat.api.js";
import code from "./api/code.api.js";
import { checkRole } from './middlewares/auth.middleware.js';

dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('Server is ready');
});

app.use(express.json());
app.use('/api/job', jobRoutes);
app.use('/api/user', userRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/matcher', matcherRoutes);
app.use('/api/shortlist', shortlistRoutes);

app.post('/api/chat', chat); //add auth middleware
app.post('/api/code', code);

export { app };


