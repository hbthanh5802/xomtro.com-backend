import { selectNotificationByConditions, updateNotificationByConditions } from '@/services/notification.service';
import { ConditionsType } from '@/types/drizzle.type';
import { NotificationSelectSchemaType } from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { paginationHelper, selectOptions } from '@/utils/schema.helper';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;
    const { whereConditions, orderConditions, pagination } = req.body;

    const { type, isRead, postId } = whereConditions ?? {};
    const { updatedAt, createdAt } = orderConditions ?? {};
    const { page, pageSize } = pagination ?? {};

    const where: ConditionsType<NotificationSelectSchemaType> = {
      userId: { operator: 'eq', value: users.id! },
      ...(type && { type: { operator: 'eq', value: type } }),
      ...(typeof isRead === 'boolean' && { isRead: { operator: 'eq', value: !!isRead } }),
      ...(postId && { postId: { operator: 'eq', value: postId } })
    };

    const options: selectOptions<NotificationSelectSchemaType> = {
      orderConditions: {
        ...(updatedAt && { updatedAt }),
        ...(createdAt && { createdAt })
      },
      ...(pagination && {
        pagination: {
          page: page,
          pageSize: pageSize
        }
      })
    };

    const totalNotificationResult = selectNotificationByConditions(where, {
      ...options,
      pagination: { page: 1, pageSize: 99999999 }
    });
    const getNotificationResult = await selectNotificationByConditions(where, options);

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, {
      results: getNotificationResult,
      pagination: paginationHelper({
        total: (await totalNotificationResult).length,
        page,
        pageSize
      })
    }).send(res);
  } catch (error) {
    next(error);
  }
};

export const setReadUserNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;
    const { ids } = req.query;

    if (!ids) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    let notificationIds: number[];
    if (Array.isArray(ids)) {
      notificationIds = ids.map((id) => Number(id)).filter((id) => typeof id === 'number');
    } else {
      notificationIds = Number.isSafeInteger(Number(ids)) ? [Number(ids)] : [];
    }

    await updateNotificationByConditions(
      {
        isRead: true
      },
      {
        id: { operator: 'in', value: notificationIds },
        userId: { operator: 'eq', value: users.id! }
      }
    );

    return new ApiResponse(StatusCodes.OK, 'Set read notifications successfully!', { ids: notificationIds }).send(res);
  } catch (error) {
    next(error);
  }
};

export const setReadAllUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users } = currentUser!;

    await updateNotificationByConditions(
      {
        isRead: true
      },
      {
        userId: { operator: 'eq', value: users.id! }
      }
    );

    return new ApiResponse(StatusCodes.OK, 'Set read all notifications successfully!').send(res);
  } catch (error) {
    next(error);
  }
};
