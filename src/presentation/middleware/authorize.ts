import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors';

/**
 * Authorization Middleware Factory
 * Checks if authenticated user has required role(s)
 * Must be used AFTER authenticate middleware
 *
 * @param roles - Allowed roles (e.g., 'admin', 'tour-guide', 'customer')
 * @returns Express middleware function
 *
 * @example
 * router.delete('/tours/:id', authenticate, authorize('admin'), deleteTour);
 * router.post('/tours', authenticate, authorize('admin', 'tour-guide'), createTour);
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Ensure user is authenticated (attached by authenticate middleware)
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Check if user's role is in the allowed roles
      if (!roles.includes(req.user.role)) {
        throw new AppError('You do not have permission to perform this action', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
