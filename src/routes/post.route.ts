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

router.post('/search/:type', postController.searchPosts);

router.get('/:postId', postController.getPost);

export default router;
