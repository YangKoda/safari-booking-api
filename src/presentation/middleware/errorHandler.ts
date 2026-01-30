import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError, ValidationError } from '@shared/errors';
import { logger } from '@infrastructure/logging/logger';
import { config } from '@infrastructure/config/env';

/**
 * Global Error Handler (Presentation Layer)
 * - Express middleware = HTTP concern => Presentation
 * - Uses AppError/ValidationError for predictable API responses
 * - Handles Multer upload errors consistently
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(
    { err: error, path: req.path, method: req.method },
    'Error caught by error handler'
  );

  // 1) Multer errors (upload)
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const maxSize = process.env.MAX_FILE_SIZE || '5242880';
      const maxSizeMB = (parseInt(maxSize, 10) / 1024 / 1024).toFixed(2);
      res.status(400).json({
        status: 'error',
        message: `File too large. Maximum size: ${maxSizeMB}MB`,
      });
      return;
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      const maxFiles = process.env.MAX_FILES_PER_UPLOAD || '10';
      res.status(400).json({
        status: 'error',
        message: `Too many files. Maximum: ${maxFiles} files`,
      });
      return;
    }

    res.status(400).json({ status: 'error', message: error.message });
    return;
  }

  // 2) Validation errors
  if (error instanceof ValidationError) {
    res.status(400).json({
      status: 'error',
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  // 3) Known application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(error instanceof ValidationError && { errors: error.errors }),
    });
    return;
  }

  // 4) Unknown/unhandled errors
  const isDev = config.nodeEnv === 'development';
  res.status(500).json({
    status: 'error',
    message: isDev ? error.message : 'Internal server error',
    ...(isDev && { stack: error.stack }),
  });
};
