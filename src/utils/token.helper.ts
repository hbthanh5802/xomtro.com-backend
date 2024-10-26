import { env } from '@/configs/env.config';
import ApiError from '@/utils/ApiError.helper';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';

const secretKey = env.JWT_SECRET_KEY as string;
const accessKey = env.JWT_ACCESS_KEY as string;
const refreshKey = env.JWT_REFRESH_KEY as string;

export const accessExpirationTime = 1 * 60 * 60; // 1 hour
export const refreshExpirationTime = 24 * 60 * 60; // 1 day

export type emailVerifyTokenType = {
  userId: number;
  email: string;
} & JwtPayload;

export type tokenPayloadType = Record<string, any> & {
  userId: number;
  email: string;
  tokenVersion: number;
} & JwtPayload;

export const generateVerifyEmailToken = (userId: number, email: string) => {
  const token = jwt.sign({ userId, email }, secretKey, {
    expiresIn: 5 * 60 // 5 minutes
  });
  return token;
};

export const verifyJwtToken = (
  token: string,
  type: 'access' | 'refresh' | 'secret'
): Promise<tokenPayloadType | emailVerifyTokenType> => {
  return new Promise((resolve, reject) => {
    const key = type === 'access' ? accessKey : type === 'refresh' ? refreshKey : secretKey;
    jwt.verify(token, key, (error, tokenPayload) => {
      if (error) {
        return reject(new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED));
      }

      if (type === 'access' || type === 'refresh') {
        resolve(tokenPayload as tokenPayloadType);
      } else if (type === 'secret') {
        resolve(tokenPayload as emailVerifyTokenType);
      }
    });
  });
};

export const generateAccessToken = (payload: tokenPayloadType, options?: jwt.SignOptions) => {
  return jwt.sign(payload, accessKey, {
    expiresIn: accessExpirationTime,
    ...(options && { ...options })
  });
};

export const generateRefreshToken = (payload: tokenPayloadType, options?: jwt.SignOptions) => {
  return jwt.sign(payload, refreshKey, {
    expiresIn: refreshExpirationTime,
    ...(options && { ...options })
  });
};
