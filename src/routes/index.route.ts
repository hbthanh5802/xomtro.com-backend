import analyticRoutes from '@/routes/analytic.route';
import assetRoutes from '@/routes/asset.route';
import authRoutes from '@/routes/auth.route';
import conversationRoutes from '@/routes/consersation.route';
import locationRoutes from '@/routes/location.route';
import postRoutes from '@/routes/post.route';
import userRoutes from '@/routes/user.route';
import express, { Express } from 'express';

const apiRouter = express.Router();

export const useRoutes = (app: Express) => {
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/users', userRoutes);
  apiRouter.use('/location', locationRoutes);
  apiRouter.use('/posts', postRoutes);
  apiRouter.use('/analytic', analyticRoutes);
  apiRouter.use('/conversations', conversationRoutes);
  apiRouter.use('/assets', assetRoutes);

  app.use('/api', apiRouter);
};
