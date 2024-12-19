import * as notificationController from '@/controllers/notification.controller';
import * as authMiddlewares from '@/middlewares/auth.middleware';
import express from 'express';

const router = express.Router();

router.post('/me', authMiddlewares.verifyUser, notificationController.getUserNotifications);

router.put('/read/all', authMiddlewares.verifyUser, notificationController.setReadAllUserNotifications);

router.put('/read', authMiddlewares.verifyUser, notificationController.setReadUserNotification);

export default router;
