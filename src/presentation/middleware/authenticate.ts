import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '@infrastructure/security/JwtService';
import { PrismaUserRepository } from '@infrastructure/database/repositories/implementations/PrismaUserRepository';
import { prisma } from '@infrastructure/database/prisma-client';
import { AppError } from '@shared/errors';
import type { DomainUserRole } from '@domain/entities/User';


// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: DomainUserRole;
      };
    }
  }
}

const jwtService = new JwtService();
const userRepository = new PrismaUserRepository(prisma);

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Get token from Authorization header
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to access this resource.', 401);
    }

    // 2) Verify token and decode payload
    const decoded: JwtPayload = jwtService.verifyAccessToken(token);

    // 3) Check if user still exists
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // 4) Check if user account is active
    if (!user.isActive()) {
      throw new AppError('This account has been deactivated.', 401);
    }

    // 5) Check if user changed password after token was issued
    if (decoded.iat) {
      const jwtTimestamp = decoded.iat;
      if (user.changedPasswordAfter(jwtTimestamp)) {
        throw new AppError('User recently changed password. Please log in again.', 401);
      }
    }

    console.log("AUTH MIDDLEWARE user.getRole():", user.getRole());
    console.log("AUTH MIDDLEWARE decoded.role:", decoded.role);



    // 6) Grant access - attach user to request
    req.user = {
      id: user.getId()!,
      email: user.getEmail().getValue(),
      role: user.getRole(),

    };

    next();
  } catch (error) {
    next(error);
  }
};
