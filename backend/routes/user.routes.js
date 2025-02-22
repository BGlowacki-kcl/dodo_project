import express from 'express';
import { checkRole } from '../middlewares/auth.middleware.js';
import { userController } from '../controllers/user.controller.js';


const router = express.Router();

router.get('/role', checkRole([]), userController.getRole); // everyone can access it
router.get('/completed', checkRole([]), userController.checkProfileCompletion);
router.get('/', checkRole(['employer', 'user', 'admin', 'jobSeeker']), userController.getUser);
router.post('/basic', checkRole(['employer', 'jobSeeker', 'signUp']), userController.createBasicUser);
router.put('/', checkRole(['employer', 'user', 'admin']), userController.updateUser);
router.delete('/', checkRole(['employer', 'user', 'admin']), userController.deleteUser);

export default router;