import * as authController from '@/controllers/auth.controller';
import * as authMiddlewares from '@/middlewares/auth.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import {
  forgotPasswordValidation,
  loginUserValidation,
  oAuthValidation,
  registerUserValidation
} from '@/validations/userValidation';
import express from 'express';

const router = express.Router();

router.post('/register', validationAsync(registerUserValidation), authController.registerUser);

router.post('/login', validationAsync(loginUserValidation), authController.loginUser);

router.post('/refresh', authController.refreshUserToken);

router.post('/logout', authMiddlewares.verifyUser, authController.logoutUser);

router.post('/google', validationAsync(oAuthValidation), authController.googleAuth);

router.get('/forgot-password', authController.getForgotPassword);

router.post('/forgot-password', validationAsync(forgotPasswordValidation), authController.completeForgotPassword);

export default router;
