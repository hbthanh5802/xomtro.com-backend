import * as postController from '@/controllers/post.controller';
import * as authMiddleware from '@/middlewares/auth.middleware';
import { uploadMiddleware } from '@/middlewares/upload.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import { insertPostValidation, insertRentalPostValidation } from '@/validations/postValidation';
import express from 'express';

const router = express.Router();

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

router.get('/:postId', postController.getPostById);

export default router;
