import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/role', checkRole([]), userController.getRole); // everyone can access it
router.get('/completed', checkRole([]), userController.checkProfileCompletion);
router.get('/', checkRole(['employer', 'user', 'admin']), userController.getUser);
router.post('/basic', checkRole([]), userController.createBasicUser);
router.put('/', checkRole(['employer', 'user', 'admin']), userController.updateUser);
router.delete('/', checkRole(['employer', 'user', 'admin']), userController.deleteUser);

export default router;