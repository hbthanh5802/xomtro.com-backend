import { env } from '@/configs/env.config';
import { getSocketIdByUserId, io } from '@/configs/socket.config';
import { deleteAssetByConditions, insertAsset, selectAssetById } from '@/services/asset.service';
import {
  insertChat,
  insertChatMembers,
  selectChatById,
  selectChatIdBetweenTwoUserId,
  selectChatMemberByConditions,
  selectIndividualChatsByUserId,
  updateChatMemberByConditions
} from '@/services/chat.service';
import { deleteResource, uploadImage } from '@/services/fileUpload.service';
import {
  insertMessage,
  selectMessageByConditions,
  selectMessagesOfChatId,
  updateMessageByConditions
} from '@/services/message.service';
import { MessageInsertSchemaType, MessageSelectSchemaType } from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { generateEmailContent, sendEmail } from '@/utils/email.helper';
import { paginationHelper, selectOptions } from '@/utils/schema.helper';
import { timeInVietNam } from '@/utils/time.helper';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const createIndividualConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;
    const { members } = req.body;

    if (!members || !Array.isArray(members)) {
      throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, ReasonPhrases.UNPROCESSABLE_ENTITY);
    }
    const isValid = members[0] === users.id || members[1] === users.id;
    if (!isValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingConversation = await selectChatIdBetweenTwoUserId(members[0], members[1]);
    if (existingConversation.length) {
      return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, existingConversation[0]).send(res);
    }
    const newConversationResult = await insertChat({ type: 'individual' });
    await insertChatMembers([
      { chatId: newConversationResult[0].id, userId: members[0] },
      { chatId: newConversationResult[0].id, userId: members[1] }
    ]);

    return new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, newConversationResult[0]).send(res);
  } catch (error) {
    next(error);
  }
};

export const createAnMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;
    const { chatId, content } = req.body;
    const image = req.file;

    if (!chatId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    const existingConversation = await selectChatById(Number(chatId));
    if (!existingConversation.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const otherMembers = await selectChatMemberByConditions({
      chatId: { operator: 'eq', value: existingConversation[0].id },
      userId: { operator: 'ne', value: users.id! }
    });
    const handleSendEmail = async () => {
      const existingMessage = await selectMessageByConditions(
        {
          chatId: { operator: 'eq', value: existingConversation[0].id },
          senderId: { operator: 'eq', value: users.id! }
        },
        1
      );
      if (!existingMessage.length) {
        const emailContent = generateEmailContent('Bạn', {
          headerText: 'Xóm Trọ',
          mainText: 'Tin nhắn đến',
          bodyText: 'Có người muốn nhắn tin cho bạn, hãy kiểm tra xem đó là ai.',
          bodySubText: `<a href="${env.CLIENT_BASE_URL}/conversations/${chatId}">Xem Ngay</a>`
        });
        const otherMemberEmails = otherMembers.map((member) => member.email).join(',');
        sendEmail(otherMemberEmails, 'Tin nhắn đến!', emailContent);
      }
    };
    handleSendEmail();

    let insertAssetResult;
    if (image) {
      const uploadImageResult = await uploadImage(image, { folder: 'conversations' });
      insertAssetResult = await insertAsset({
        type: 'image',
        url: uploadImageResult.secure_url,
        name: uploadImageResult.public_id,
        folder: 'conversations',
        userId: users.id
      });
    }
    const insertMessagePayload: MessageInsertSchemaType = {
      chatId: existingConversation[0].id,
      senderId: users.id!,
      content: content ?? '',
      messageType: image ? 'file' : 'text',
      allowRecallTime: timeInVietNam().add(5, 'minute').toDate(),
      ...(insertAssetResult && { assetId: insertAssetResult[0].id })
    };
    const insertMessageResult = await insertMessage(insertMessagePayload);
    const messageResult = await selectMessageByConditions({ id: { operator: 'eq', value: insertMessageResult[0].id } });

    // Emit 'new-message' event to all others in conversation
    const otherMemberSocketIds = otherMembers.map((member) => getSocketIdByUserId(member.userId!));
    if (otherMemberSocketIds.length) {
      io.to(otherMemberSocketIds).emit('new-message', messageResult[0]);
    }

    return new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, messageResult[0]).send(res);
  } catch (error) {
    next(error);
  }
};

export const getUserIndividualConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;

    const response = await selectIndividualChatsByUserId(users.id!);

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, response).send(res);
  } catch (error) {
    next(error);
  }
};

export const getMessagesByConversationId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;
    const { conversationId } = req.params;
    const { page, pageSize, sentAt } = req.query;

    if (!conversationId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    const existingConversation = await selectChatMemberByConditions({
      userId: {
        operator: 'eq',
        value: users.id!
      },
      chatId: {
        operator: 'eq',
        value: Number(conversationId)
      }
    });
    if (!existingConversation.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }
    const options: selectOptions<MessageSelectSchemaType> = {
      orderConditions: {
        ...(sentAt && { sentAt: sentAt === 'asc' || sentAt === 'desc' ? sentAt : undefined })
      },
      ...(page && {
        pagination: {
          ...(page && { page: Number(page) }),
          ...(pageSize && { pageSize: Number(pageSize) })
        }
      })
    };
    const totalMessageResponse = await selectMessagesOfChatId(existingConversation[0].chatId!, {
      ...options,
      pagination: { page: 1, pageSize: 99999999 }
    });
    const getMessageResponse = await selectMessagesOfChatId(existingConversation[0].chatId!, options);

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, {
      results: getMessageResponse,
      pagination: paginationHelper({
        total: totalMessageResponse.length,
        page: Number(page) ?? 1,
        pageSize: Number(pageSize) ?? 15
      })
    }).send(res);
  } catch (error) {
    next(error);
  }
};

export const updateChatMemberLastRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;
    const { conversationId } = req.params;

    if (!conversationId || !Number.isSafeInteger(Number(conversationId))) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    await updateChatMemberByConditions(
      { lastReadAt: timeInVietNam().toDate() },
      {
        chatId: {
          operator: 'eq',
          value: Number(conversationId)
        },
        userId: { operator: 'eq', value: users.id! }
      }
    );

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK).send(res);
  } catch (error) {
    next(error);
  }
};

export const recallMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;
    const { messageId } = req.params;

    if (!messageId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const existingMessage = await selectMessageByConditions({
      senderId: {
        operator: 'eq',
        value: Number(users.id)
      },
      id: {
        operator: 'eq',
        value: Number(messageId)
      },
      isRecalled: {
        operator: 'eq',
        value: false
      }
    });
    if (!existingMessage.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }
    if (timeInVietNam().toDate().getTime() > new Date(existingMessage[0].allowRecallTime).getTime()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Message can not be recalled');
    }

    if (existingMessage[0].assetId) {
      const messageAsset = await selectAssetById(existingMessage[0].assetId);
      await Promise.allSettled([
        deleteAssetByConditions({ id: { operator: 'eq', value: existingMessage[0].assetId } }),
        deleteResource(messageAsset[0].name, 'image')
      ]);
    }

    await updateMessageByConditions(
      {
        isRecalled: true
      },
      {
        id: {
          operator: 'eq',
          value: Number(messageId)
        }
      }
    );
    const recalledMessage = await selectMessageByConditions({
      id: {
        operator: 'eq',
        value: Number(messageId)
      }
    });

    // Emit 'new-message' event to all others in conversation
    const otherMembers = await selectChatMemberByConditions({
      chatId: { operator: 'eq', value: recalledMessage[0].chatId },
      userId: { operator: 'ne', value: users.id! }
    });
    const otherMemberSocketIds = otherMembers.map((member) => getSocketIdByUserId(member.userId!));
    if (otherMemberSocketIds.length) {
      io.to(otherMemberSocketIds).emit('recall-message', recalledMessage[0]);
    }

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, recalledMessage[0]).send(res);
  } catch (error) {
    next(error);
  }
};
