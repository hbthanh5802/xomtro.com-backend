import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
export class ApiResponse {
  statusCode: number;
  message: string;
  data?: Record<string, any> | unknown;

  constructor(statusCode: number, message: string, data?: Record<string, any> | unknown) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  public send(res: Response) {
    const responseData = {
      statusCode: this.statusCode,
      message: this.message || StatusCodes[this.statusCode],
      data: this.data || null
    };

    res.status(this.statusCode).json(responseData);
  }
}
