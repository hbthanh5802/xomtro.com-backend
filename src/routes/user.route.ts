import * as userController from '@/controllers/user.controller';
import * as authMiddlewares from '@/middlewares/auth.middleware';
import { uploadMiddleware } from '@/middlewares/upload.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import { addressValidation, changeUserPasswordValidation } from '@/validations/userValidation';
import express from 'express';

const router = express.Router();

// User auth
router.get('/verify/email', userController.getVerifyUserEmail);
router.post('/verify/email', userController.verifyUserEmail);
router.put(
  '/password',
  authMiddlewares.verifyUser,
  validationAsync(changeUserPasswordValidation),
  userController.changeUserPassword
);

// User avatar
router.get('/avatar', authMiddlewares.verifyUser, userController.getUserAvatar);

router.put('/avatar', authMiddlewares.verifyUser, uploadMiddleware.single('avatar'), userController.updateUserAvatar);

// User addresses
router.post(
  '/addresses',
  authMiddlewares.verifyUser,
  validationAsync(addressValidation),
  userController.createUserAddress
);

router.put(
  '/addresses/:addressId',
  authMiddlewares.verifyUser,
  validationAsync(addressValidation),
  userController.updateUserAddress
);

router.delete('/addresses', authMiddlewares.verifyUser, userController.removeUserAddress);

router.get('/addresses', authMiddlewares.verifyUser, userController.getUserAddresses);

export default router;
