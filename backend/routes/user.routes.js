import express from 'express';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.get('/all', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateuser);
router.delete('/:id', userController.deleteUser);

export default router;