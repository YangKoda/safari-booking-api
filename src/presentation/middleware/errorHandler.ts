import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@shared/errors';
import { logger } from '@infrastructure/logging/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(
    {
      err: error,
      path: req.path,
      method: req.method,
    },
    'Error caught by error handler'
  );


  // Validation Error
  if (error instanceof ValidationError) {
    res.status(400).json({
      status: 'error',
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  // Application Error
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
    return;
  }

  // Default Server Error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
