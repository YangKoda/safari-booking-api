import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@shared/errors';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Basic validation - extend this based on your needs
      if (!req.body) {
        throw new ValidationError('Request body is required', {
          body: ['Request body cannot be empty'],
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
