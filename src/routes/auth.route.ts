import * as authController from '@/controllers/auth.controller';
import * as authMiddlewares from '@/middlewares/auth.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import { loginUserValidation, registerUserValidation } from '@/validations/userValidation';
import express from 'express';

const router = express.Router();

router.post('/register', validationAsync(registerUserValidation), authController.registerUser);

router.post('/login', validationAsync(loginUserValidation), authController.loginUser);

router.post('/refresh', authController.refreshUserToken);

router.post('/logout', authMiddlewares.verifyUser, authController.logoutUser);

export default router;
