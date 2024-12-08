import * as postController from '@/controllers/post.controller';
import * as authMiddleware from '@/middlewares/auth.middleware';
import { uploadMiddleware } from '@/middlewares/upload.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import {
  insertJoinPostValidation,
  insertPassPostItemValidation,
  insertPassPostValidation,
  insertRentalPostValidation,
  insertWantedPostValidation
} from '@/validations/postValidation';
import express from 'express';

const router = express.Router();

// -- POST
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
  validationAsync(insertWantedPostValidation),
  postController.createWantedPost
);
// Create a new join post
router.post(
  '/join',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  validationAsync(insertJoinPostValidation),
  postController.createJoinPost
);
// Create a new pass post
router.post(
  '/pass',
  authMiddleware.verifyUser,
  uploadMiddleware.array('assets'),
  validationAsync(insertPassPostValidation),
  postController.createPassPost
);
// Add a new interested post
router.post('/interested', authMiddleware.verifyUser, postController.createUserPostInterested);

// -- GET
// Get full post detail
router.get('/:postId', postController.getPostById);
// Search pass posts
router.post('/search/pass', postController.searchPassPosts);
// Search others post type
router.post('/search/:type', postController.searchPosts);

// -- UPDATE
// Change post status
router.put('/:postId/status', authMiddleware.verifyUser, postController.hiddenPostById);
// Increase post view
router.put('/:postId/view', postController.updateViewCount);
// Update existing rental post
router.put(
  '/rental/:postId',
  authMiddleware.verifyLandlord,
  uploadMiddleware.array('assets'),
  validationAsync(insertRentalPostValidation),
  postController.updateRentalPost
);
// Update existing wanted post
router.put(
  '/wanted/:postId',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  validationAsync(insertWantedPostValidation),
  postController.updateWantedPost
);
// Update existing join post
router.put(
  '/join/:postId',
  authMiddleware.verifyRenter,
  uploadMiddleware.array('assets'),
  validationAsync(insertJoinPostValidation),
  postController.updateJoinPost
);
// Update an existing pass post item
router.put(
  '/pass/:postId/items/:itemId',
  authMiddleware.verifyUser,
  validationAsync(insertPassPostItemValidation),
  postController.updatePassPostItem
);
// Update an existing pass post
router.put(
  '/pass/:postId',
  authMiddleware.verifyUser,
  uploadMiddleware.array('assets'),
  validationAsync(insertPassPostValidation),
  postController.updatePassPost
);
// Renew existing post
router.put('/:postId/renew', authMiddleware.verifyUser, postController.renewPost);

// -- DELETE
// Remove pass post items by id list
router.delete('/pass/:postId/items', authMiddleware.verifyUser, postController.removePassPostItems);
// Remove post assets by id list
router.delete('/:postId/assets', authMiddleware.verifyUser, postController.removePostAssets);
// Remove a post
router.delete('/:postId', authMiddleware.verifyUser, postController.removePostById);
// Remove a interested post
router.delete('/interested/:postId', authMiddleware.verifyUser, postController.removeUserPostInterested);

export default router;
