import express from 'express';
import userController from '../controllers/user.controller.js';
import { checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:uid', checkRole(['employer', 'user', 'admin']), userController.getUser);
router.get('/role', checkRole([]), userController.getRole); // everyone can access it
router.get('/completed', checkRole([]), userController.checkProfileCompletion);
router.post('/', userController.createUser);
router.post('/basic', checkRole([]), userController.createBasicUser);
router.put('/', userController.updateuser);
router.delete('/', userController.deleteUser);

export default router;