import { ApiResponse } from '@/utils/ApiResponse.helper';
import { formatZodErrors } from '@/utils/ZodErrorFormat.helper';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ZodError, ZodSchema, z } from 'zod';

export const validationAsync = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      formatZodErrors(error);
      return new ApiResponse(
        StatusCodes.UNPROCESSABLE_ENTITY,
        ReasonPhrases.UNPROCESSABLE_ENTITY,
        formatZodErrors(error)
      ).send(res);
    }
  }
};
