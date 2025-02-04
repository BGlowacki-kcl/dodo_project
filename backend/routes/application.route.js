import express from 'express';
import applicationController from '../controllers/application.controller';
import { ExplainVerbosity } from 'mongodb';

const router = express.Router();

router.post('/apply', applicationController.apply);
router.get('/applicant/:applicantId', applicationController.getApplication);
router.delete('/cancel', applicationController.cancel);
router.put('/:id/status', applicationController.updateApplicationStatus);


export default router;

