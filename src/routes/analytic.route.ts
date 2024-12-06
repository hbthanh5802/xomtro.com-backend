import * as analyticController from '@/controllers/analytic.controller';
import express from 'express';

const router = express.Router();

// Get post count by type
router.post('/posts/count-by-type', analyticController.getPostsCountByTypeWithPostConditions);

export default router;
