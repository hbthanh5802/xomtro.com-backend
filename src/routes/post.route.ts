import * as postController from '@/controllers/post.controller';
import * as authMiddleware from '@/middlewares/auth.middleware';
import { uploadMiddleware } from '@/middlewares/upload.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import { insertPostValidation, insertRentalPostValidation } from '@/validations/postValidation';
import express from 'express';

const router = express.Router();

router.get('/:postId', postController.getPostById);

router.post(
  '/rental',
  authMiddleware.verifyLandlord,
  uploadMiddleware.array('assets'),
  // validationAsync(insertRentalPostValidation),
  postController.createRentalPost
);

router.post(
  '/wanted',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  // validationAsync(insertRentalPostValidation),
  postController.createWantedPost
);

router.post(
  '/join',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  // validationAsync(insertRentalPostValidation),
  postController.createJoinPost
);

router.post(
  '/pass',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  // validationAsync(insertRentalPostValidation),
  postController.createPassPost
);

router.post('/search/pass', postController.searchPassPosts);

router.post('/search/:type', postController.searchPosts);

router.put('/:postId/status', authMiddleware.verifyUser, postController.hiddenPostById);

router.delete('/:postId/assets', authMiddleware.verifyUser, postController.removePostAssets);

router.delete('/:postId', authMiddleware.verifyUser, postController.removePostById);

export default router;
