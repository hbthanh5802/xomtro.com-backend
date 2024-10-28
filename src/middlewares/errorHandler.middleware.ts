import ApiError from '@/utils/ApiError.helper';
import { NextFunction } from 'connect';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (error: ApiError, req: Request, res: Response, next: NextFunction) => {
  if (!error.statusCode) {
    error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }

  const responseError = {
    statusCode: error.statusCode,
    message: error.message || StatusCodes[error.statusCode],
    stack: error.stack
  };

  if (process.env.NODE_ENV !== 'development') {
    delete responseError.stack;
  }

  res.status(responseError.statusCode).json(responseError);
};
