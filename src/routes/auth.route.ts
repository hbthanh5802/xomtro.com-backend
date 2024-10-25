import * as authController from '@/controllers/auth.controller';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import { loginUserValidation, registerUserValidation } from '@/validations/userValidation';
import express from 'express';

const router = express.Router();

router.post('/register', validationAsync(registerUserValidation), authController.registerUser);

router.post('/login', validationAsync(loginUserValidation), authController.loginUser);

router.get('/verify/email', authController.getVerifyUserEmail);

router.post('/verify/email', authController.verifyUserEmail);

export default router;
