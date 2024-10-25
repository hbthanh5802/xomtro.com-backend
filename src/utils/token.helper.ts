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

export const generateVerifyEmailToken = (userId: number, email: string) => {
  const token = jwt.sign({ userId, email }, secretKey, {
    // 5 minutes
    expiresIn: 5 * 60
  });

  return token;
};

export const verifyJwtToken = (token: string, type: 'access' | 'refresh' | 'secret') => {
  return new Promise((resolve, reject) => {
    const key = type === 'access' ? accessKey : type === 'refresh' ? refreshKey : secretKey;
    jwt.verify(token, key, (error, tokenPayload) => {
      if (error) {
        return reject(new ApiError(StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED));
      }
      resolve(tokenPayload);
    });
  });
};

export type tokenPayloadType = Record<string, any> & {
  userId: number;
  tokenVersion: number;
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
