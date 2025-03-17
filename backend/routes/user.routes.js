import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import { userController } from '../controllers/user.controller.js';


const router = express.Router();

router.get('/role', checkRole([]), userController.getRole);
router.get('/completed', checkRole([]), userController.checkProfileCompletion);
router.get('/', checkRole(['employer', 'jobSeeker', 'admin']), userController.getUser);
router.post('/basic', checkRole(['employer', 'jobSeeker', 'signUp']), userController.createBasicUser);
router.put('/', checkRole(['employer', 'jobSeeker', 'admin']), userController.updateUser);
router.delete('/', checkRole(['employer', 'jobSeeker', 'admin']), userController.deleteUser);
router.get('/:userId', userController.getUserById);

export default router;