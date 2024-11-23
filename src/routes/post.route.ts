import * as postController from '@/controllers/post.controller';
import * as authMiddleware from '@/middlewares/auth.middleware';
import { uploadMiddleware } from '@/middlewares/upload.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import { insertRentalPostValidation } from '@/validations/postValidation';
import express from 'express';

const router = express.Router();

// Get full post detail
router.get('/:postId', postController.getPostById);
// Create a new rental post
router.post(
  '/rental',
  authMiddleware.verifyLandlord,
  uploadMiddleware.array('assets'),
  validationAsync(insertRentalPostValidation),
  postController.createRentalPost
);
// Create a new wanted post
router.post(
  '/wanted',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  // validationAsync(insertRentalPostValidation),
  postController.createWantedPost
);
// Create a new join post
router.post(
  '/join',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  // validationAsync(insertRentalPostValidation),
  postController.createJoinPost
);
// Create a new pass post
router.post(
  '/pass',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  // validationAsync(insertRentalPostValidation),
  postController.createPassPost
);
// Search pass posts
router.post('/search/pass', postController.searchPassPosts);
// Search others post type
router.post('/search/:type', postController.searchPosts);
// Change post status
router.put('/:postId/status', authMiddleware.verifyUser, postController.hiddenPostById);
// Increase post view
router.put('/:postId/view', postController.updateViewCount);
// Update existing rental post
router.put(
  '/rental/:postId',
  authMiddleware.verifyUser,
  uploadMiddleware.array('assets'),
  postController.updateRentalPost
);
// Update existing wanted post
router.put(
  '/wanted/:postId',
  authMiddleware.verifyUser,
  uploadMiddleware.array('assets'),
  postController.updateWantedPost
);
// Update existing join post
router.put('/join/:postId', authMiddleware.verifyUser, uploadMiddleware.array('assets'), postController.updateJoinPost);
// Update an existing pass post item
router.put('/pass/:postId/items/:itemId', authMiddleware.verifyUser, postController.updatePassPostItem);
// Update an existing pass post
router.put('/pass/:postId', authMiddleware.verifyUser, uploadMiddleware.array('assets'), postController.updatePassPost);
// Update existing wanted post
router.put(
  '/wanted/:postId',
  authMiddleware.verifyUser,
  uploadMiddleware.array('assets'),
  postController.updatePassPost
);
// Remove pass post items by id list
router.delete('/pass/:postId/items', authMiddleware.verifyUser, postController.removePassPostItems);
// Remove post assets by id list
router.delete('/:postId/assets', authMiddleware.verifyUser, postController.removePostAssets);
// Remove a post
router.delete('/:postId', authMiddleware.verifyUser, postController.removePostById);

export default router;
