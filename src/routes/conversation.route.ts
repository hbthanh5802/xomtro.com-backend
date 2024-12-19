import * as conversationController from '@/controllers/conversation.controller';
import * as authMiddleware from '@/middlewares/auth.middleware';
import { uploadMiddleware } from '@/middlewares/upload.middleware';
import { validationAsync } from '@/middlewares/validationSchema.middleware';
import { insertConversationValidation, insertMessageValidation } from '@/validations/conversationValidation';
import express from 'express';

const router = express.Router();

router.post(
  '/individual',
  authMiddleware.verifyUser,
  validationAsync(insertConversationValidation),
  conversationController.createIndividualConversation
);

router.post(
  '/messages',
  authMiddleware.verifyUser,
  uploadMiddleware.single('image'),
  validationAsync(insertMessageValidation),
  conversationController.createAnMessage
);

// Get user individual conversations
router.get('/individual', authMiddleware.verifyUser, conversationController.getUserIndividualConversations);

// Get messages from chat
router.get('/:conversationId/messages', authMiddleware.verifyUser, conversationController.getMessagesByConversationId);

// Update last read conversation
router.put('/:conversationId/read', authMiddleware.verifyUser, conversationController.updateChatMemberLastRead);

// Recall a message
router.put('/messages/:messageId/recall', authMiddleware.verifyUser, conversationController.recallMessage);

export default router;
