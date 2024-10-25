import authRoutes from '@/routes/auth.route';
import express, { Express } from 'express';

const apiRouter = express.Router();

export const useRoutes = (app: Express) => {
  apiRouter.use('/auth', authRoutes);

  app.use('/api', apiRouter);
};
