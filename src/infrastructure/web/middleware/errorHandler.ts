import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@shared/errors';
import Logger from '@shared/utils/logger';
import { config } from '@infrastructure/config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    Logger.error(err.message);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    });
    return;
  }

  // Unhandled errors
  Logger.error('Unhandled error', err);
  res.status(500).json({
    status: 'error',
    message: config.isDevelopment ? err.message : 'Internal server error',
  });
};
