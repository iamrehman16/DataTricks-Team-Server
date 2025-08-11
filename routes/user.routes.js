// routes/user.routes.js
import express from 'express';
import * as userController from '../controllers/user.controller.js';
import authenticateToken from '../middlewares/auth.middleware.js';


const router = express.Router();

// Auth-related routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/refresh',userController.refresh);
router.post('/logout',authenticateToken,userController.logout);
router.post('/verify-otp', userController.verifyOtp);



//crud
router.get('/:id',authenticateToken,userController.getById);
router.put('/:id',authenticateToken,userController.updateUser);
router.delete('/:id',authenticateToken,userController.deleteUser);

export default router;