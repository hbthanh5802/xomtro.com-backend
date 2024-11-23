import { ApiResponse } from '@/utils/ApiResponse.helper';
import { formatZodErrors } from '@/utils/ZodErrorFormat.helper';
import { cleanObject } from '@/utils/constants.helper';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ZodError, ZodSchema } from 'zod';

export const validationAsync = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Received data', req.body);
    const cleanedData = cleanObject(req.body);
    await schema.parseAsync(cleanedData);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return new ApiResponse(
        StatusCodes.UNPROCESSABLE_ENTITY,
        ReasonPhrases.UNPROCESSABLE_ENTITY,
        formatZodErrors(error)
      ).send(res);
    }
  }
};
