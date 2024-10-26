import authRoutes from '@/routes/auth.route';
import userRoutes from '@/routes/user.route';
import express, { Express } from 'express';

const apiRouter = express.Router();

export const useRoutes = (app: Express) => {
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/users', userRoutes);

  app.use('/api', apiRouter);
};
