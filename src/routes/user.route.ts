import * as userController from '@/controllers/user.controller';
import * as authMiddlewares from '@/middlewares/auth.middleware';
import { uploadMiddleware } from '@/middlewares/upload.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import { changeUserPasswordValidation } from '@/validations/userValidation';
import express from 'express';

const router = express.Router();

router.get('/verify/email', userController.getVerifyUserEmail);

router.post('/verify/email', userController.verifyUserEmail);

router.put(
  '/password',
  authMiddlewares.verifyUser,
  validationAsync(changeUserPasswordValidation),
  userController.changeUserPassword
);

router.put('/avatar', authMiddlewares.verifyUser, uploadMiddleware.single('avatar'), userController.updateUserAvatar);

export default router;
