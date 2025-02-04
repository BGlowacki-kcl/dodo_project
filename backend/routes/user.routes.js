import express from 'express';
import userController from '../controllers/user.controller.js';
import { checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:jobId', checkRole(['employer']), userController.getUsersWhoApplied);
router.get('/:uid', checkRole(['employer', 'user', 'admin']), userController.getUser);
router.get('/role', checkRole([]), userController.getRole); // everyone can access it
router.get('/completed', checkRole([]), userController.checkProfileCompletion);
router.post('/', userController.createUser);
router.put('/:id', userController.updateuser);
router.delete('/:id', userController.deleteUser);

export default router;