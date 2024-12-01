import * as postController from '@/controllers/post.controller';
import * as userController from '@/controllers/user.controller';
import * as authMiddlewares from '@/middlewares/auth.middleware';
import { uploadMiddleware } from '@/middlewares/upload.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import {
  addressValidation,
  changeUserPasswordValidation,
  updateUserProfileValidation
} from '@/validations/userValidation';
import express from 'express';

const router = express.Router();

//-- User auth
router.get('/verify/email', userController.getVerifyUserEmail);

router.post('/verify/email', userController.verifyUserEmail);

router.put(
  '/password',
  authMiddlewares.verifyUser,
  validationAsync(changeUserPasswordValidation),
  userController.changeUserPassword
);

//-- User avatar
router.get('/me/avatar', authMiddlewares.verifyUser, userController.getMyAvatar);

router.get('/:userId/avatar', userController.getUserAvatar);

router.put('/avatar', authMiddlewares.verifyUser, uploadMiddleware.single('avatar'), userController.updateUserAvatar);

//-- User addresses
router.post(
  '/addresses',
  authMiddlewares.verifyUser,
  validationAsync(addressValidation),
  userController.createUserAddress
);

router.put('/addresses/:addressId/default', authMiddlewares.verifyUser, userController.setDefaultAddress);

router.put(
  '/addresses/:addressId',
  authMiddlewares.verifyUser,
  validationAsync(addressValidation),
  userController.updateUserAddress
);

router.delete('/addresses', authMiddlewares.verifyUser, userController.removeUserAddress);

router.get('/addresses', authMiddlewares.verifyUser, userController.getUserAddresses);

router.get('/addresses/:userId/default', userController.getUserDefaultAddress);

//-- Profile
router.put(
  '/me',
  authMiddlewares.verifyUser,
  validationAsync(updateUserProfileValidation),
  userController.updateUserProfile
);

router.get('/:userId', userController.getUserProfile);

// Get user interested posts
router.post('/interested', authMiddlewares.verifyUser, postController.getInterestedUserPosts);

export default router;
