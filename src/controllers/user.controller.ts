import { handleUserTokenProcess } from '@/controllers/auth.controller';
import {
  deleteAddressByConditions,
  deleteAddressById,
  insertAddress,
  updateAddressById
} from '@/services/address.service';
import { insertAsset, selectAssetById, selectAssetsByConditions, updateAssetById } from '@/services/asset.service';
import { deleteResource, uploadAvatar, uploadImage } from '@/services/fileUpload.service';
import { searchTokenByCondition } from '@/services/token.service';
import {
  selectFullUserByConditions,
  selectUserAvatarByUserId,
  selectUserDetailByEmail,
  selectUserDetailById,
  updateUserById,
  updateUserDetailById
} from '@/services/user.service';
import {
  addressSchemaType,
  assetSchemaType,
  assetType,
  tokenSchemaType,
  userDetailSchemaType
} from '@/types/schema.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { cleanObject } from '@/utils/constants.helper';
import { generateVerifyEmailContent, sendEmail } from '@/utils/email.helper';
import { formatTimeForVietnamese, timeInVietNam } from '@/utils/time.helper';
import { generateOtpCode, tokenPayloadType } from '@/utils/token.helper';
import bcrypt from 'bcrypt';
import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { searchAddressByConditions } from '../services/address.service';
import { insertToken, removeTokenByCondition } from './../services/token.service';

// Get verify user email token
export const getVerifyUserEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string;
    if (!email) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);

    const userDetailResult = await selectUserDetailByEmail(email);
    const existingUser = userDetailResult[0];

    if (!existingUser) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'User is not exist!').send(res);
    }

    if (existingUser.isEmailVerified) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'User email had already been actived.').send(res);
    }

    if (existingUser.email === email) {
      await removeTokenByCondition({ userId: existingUser.userId, type: 'otp', target: 'email' });
      const verifyOtp = generateOtpCode(6);

      const expirationTime = timeInVietNam().add(5, 'minute').toDate();
      const tokenPayload: tokenSchemaType = {
        userId: existingUser.userId,
        value: verifyOtp,
        type: 'otp',
        expirationTime: expirationTime,
        target: 'email'
      };

      const emailContent = generateVerifyEmailContent(verifyOtp, formatTimeForVietnamese(expirationTime), {
        headerText: 'Verify Your Email'
      });
      await sendEmail(existingUser.email, 'Verify Your Account', emailContent);
      await insertToken(tokenPayload);

      return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK).send(res);
    }
  } catch (error) {
    next(error);
  }
};

// Verify user email token
export const verifyUserEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);

    const userDetailResult = await selectUserDetailByEmail(email);
    if (!userDetailResult.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Not existing user.');
    }

    const existingUser = userDetailResult[0];
    if (existingUser.isEmailVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User email has been already verified!');
    }

    const existingOtpCode = await searchTokenByCondition({
      value: otpCode,
      userId: existingUser.userId,
      type: 'otp',
      target: 'email',
      isActived: true
    });
    if (!existingOtpCode.length) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
    }

    await updateUserDetailById(existingUser.userId, { isEmailVerified: true });
    await updateUserById(existingUser.userId, { status: 'actived' });
    await removeTokenByCondition({ userId: existingUser.userId, type: 'otp', target: 'email' });

    const fullUserResult = await selectFullUserByConditions({ userId: existingUser.userId });
    const { users, users_detail } = fullUserResult[0];
    const tokenPayload: tokenPayloadType = {
      userId: users.id,
      email: users_detail.email,
      tokenVersion: users.tokenVersion
    };

    const { accessToken, refreshToken } = await handleUserTokenProcess(tokenPayload);

    res.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict'
    });

    const responseData = {
      userDetail: users_detail,
      meta: { accessToken, refreshToken }
    };

    return new ApiResponse(StatusCodes.OK, 'Email was verified successfully!', responseData).send(res);
  } catch (error) {
    next(error);
  }
};

// Change user password
export const changeUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser!;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const { password: currentUserPassword, id } = currentUser.users!;
    const isMatching = await bcrypt.compare(oldPassword, currentUserPassword);
    if (!isMatching) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'Old password is incorrect!').send(res);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUserById(id!, { password: hashedPassword });
    return new ApiResponse(StatusCodes.OK, 'Change password successfully!').send(res);
  } catch (error) {
    next(error);
  }
};

// Get user avatar
export const getUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const selectAvatarResult = await selectUserAvatarByUserId(Number(userId));
    if (!selectAvatarResult.length) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, selectAvatarResult[0]).send(res);
  } catch (error) {
    next(error);
  }
};

export const getMyAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;

    if (!users_detail.avatarAssetId) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }

    const selectAvatarResult = await selectAssetById(users_detail.avatarAssetId);
    if (!selectAvatarResult.length) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, selectAvatarResult[0]).send(res);
  } catch (error) {
    next(error);
  }
};

// Update user avatar
const updateExistingAvatar = async (assetId: number, uploadResult: UploadApiResponse) => {
  const selectAssetResult = await selectAssetById(assetId);
  await deleteResource(selectAssetResult[0].name, 'image');
  await updateAssetById(assetId, {
    name: uploadResult.public_id,
    url: uploadResult.url
  });
};

const createNewAvatarAsset = async (userId: number, uploadResult: UploadApiResponse) => {
  const insertAssetPayload: assetSchemaType = {
    name: uploadResult.public_id,
    folder: 'avatars',
    type: 'image',
    url: uploadResult.url,
    tags: JSON.stringify(['avatar']),
    format: uploadResult.forma,
    userId
  };
  const insertResult = await insertAsset(insertAssetPayload);
  return insertResult[0].id;
};

export const updateUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'No file provided.').send(res);
    }

    const fileType = req.file.mimetype.split('/')[0];
    if (fileType !== assetType.IMAGE) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, 'Invalid file type. Only images are allowed.').send(res);
    }

    const uploadResult = await uploadAvatar(req.file, { folder: 'avatars' });
    const { avatarAssetId, userId } = req.currentUser?.users_detail!;

    if (avatarAssetId) {
      await updateExistingAvatar(avatarAssetId, uploadResult);
      await updateUserDetailById(userId, { avatarAssetId });
    } else {
      const newAssetId = await createNewAvatarAsset(userId, uploadResult);
      await updateUserDetailById(userId, { avatarAssetId: newAssetId });
    }

    const selectAvatarResult = await selectAssetsByConditions({
      userId: {
        operator: 'eq',
        value: userId
      },
      type: {
        operator: 'eq',
        value: 'image'
      },
      folder: {
        operator: 'eq',
        value: 'avatars'
      }
    });

    return new ApiResponse(StatusCodes.OK, 'Avatar updated successfully!', selectAvatarResult[0]).send(res);
  } catch (error) {
    next(error);
  }
};

export const createUserAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser?.users;
    const { provinceName, districtName, wardName, detail, postalCode, longitude, latitude } = req.body;

    const insertAddressPayload: addressSchemaType = {
      userId: currentUser?.id,
      provinceName,
      districtName,
      wardName,
      detail,
      longitude,
      latitude
    };
    const insertResult = await insertAddress(insertAddressPayload);
    const justInsertedAddress = await searchAddressByConditions({
      id: {
        operator: 'eq',
        value: insertResult[0].id
      }
    });

    return new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, justInsertedAddress).send(res);
  } catch (error) {
    next(error);
  }
};

export const updateUserAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser?.users;
    const { addressId } = req.params;

    if (!addressId) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_GATEWAY).send(res);
    }

    const { provinceName, districtName, wardName, detail, postalCode, longitude, latitude } = req.body;
    const addressPayload: addressSchemaType = {
      provinceName,
      districtName,
      wardName,
      detail,
      longitude,
      latitude
    };
    await updateAddressById(Number(addressId), addressPayload);
    const getAddressResult = await searchAddressByConditions({
      id: {
        operator: 'eq',
        value: Number(addressId)
      }
    });

    return new ApiResponse(StatusCodes.CREATED, ReasonPhrases.CREATED, getAddressResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const removeUserAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser?.users;
    const { addressIds } = req.query;
    if (!addressIds) {
      return new ApiResponse(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST).send(res);
    }

    if (Array.isArray(addressIds)) {
      await deleteAddressByConditions({
        id: {
          operator: 'in',
          value: addressIds.map((value) => Number(value))
        },
        userId: {
          operator: 'eq',
          value: currentUser?.id
        }
      });
    } else {
      await deleteAddressById(Number(addressIds));
    }

    return new ApiResponse(StatusCodes.OK, 'Delete successfully!').send(res);
  } catch (error) {
    next(error);
  }
};

export const getUserAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser?.users;

    const selectResult = await searchAddressByConditions({
      userId: { operator: 'eq', value: currentUser?.id }
    });

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, selectResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.currentUser;
    const { users_detail } = currentUser!;
    const { bio, firstName, lastName, phone, gender, dob, role } = req.body;

    const updateProfilePayload: Partial<userDetailSchemaType> = {
      bio,
      firstName,
      lastName,
      phone,
      gender,
      dob,
      role
    };
    console.log(cleanObject(updateProfilePayload));
    await updateUserDetailById(users_detail.userId!, cleanObject(updateProfilePayload));
    const userDetailResult = await selectUserDetailByEmail(users_detail.email);

    return new ApiResponse(StatusCodes.OK, 'Update profile successfully!', userDetailResult[0]).send(res);
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }

    const userDetailResult = await selectUserDetailById(Number(userId));
    if (!userDetailResult.length) {
      return new ApiResponse(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND).send(res);
    }

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, userDetailResult[0]).send(res);
  } catch (error) {
    next(error);
  }
};
