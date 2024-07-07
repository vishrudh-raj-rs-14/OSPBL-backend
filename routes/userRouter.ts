import express from 'express';
import {
  deleteUser,
  getAllUsers,
  login,
  logout,
  protect,
  register,
  restricTo,
} from '../controllers/userController';

const router = express.Router();

router.get('/', protect, restricTo('ADMIN'), getAllUsers);
router.delete('/:id', protect, restricTo('ADMIN'), deleteUser);

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

export default router;
