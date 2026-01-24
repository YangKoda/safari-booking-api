import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@shared/errors';
import { logger } from '@infrastructure/logging/logger';
import multer from 'multer';



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



    // Multer file upload errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const maxSize = process.env.MAX_FILE_SIZE || '5242880';
      const maxSizeMB = (parseInt(maxSize, 10) / 1024 / 1024).toFixed(2);
      res.status(400).json({
        status: 'error',
        message: `File too large. Maximum size: ${maxSizeMB}MB`,
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      const maxFiles = process.env.MAX_FILES_PER_UPLOAD || '5';
      res.status(400).json({
        status: 'error',
        message: `Too many files. Maximum: ${maxFiles} files`,
      });
    }
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }

  // Default Server Error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });


};
