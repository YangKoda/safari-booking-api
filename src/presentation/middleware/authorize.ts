import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/errors';
import { DomainUserRole } from '@domain/entities/User';


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
export const authorize = (...roles: DomainUserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Ensure user is authenticated (attached by authenticate middleware)
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Safely get user role
      if (!req.user.role) {
        throw new AppError('User role not found', 401);
      }

      // Normalize role casing
      const userRole = req.user.role as DomainUserRole;

      // Debug
      // console.log('AUTHORIZE allowed roles:', allowedRoles);
      // console.log('AUTHORIZE req.user.role:', userRole);

      // Check if user's role is in the allowed roles
      if (!roles.includes(userRole)) {
        throw new AppError('You do not have permission to perform this action', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
