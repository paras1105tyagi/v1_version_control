import express from 'express';
import { signup, login, deleteUser } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.delete('/user', auth, deleteUser);

export default router;
