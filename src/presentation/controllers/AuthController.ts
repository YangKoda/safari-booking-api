import { Request, Response, NextFunction } from 'express';
import { BcryptPasswordService } from '@infrastructure/security/BcryptPasswordService';
import { JwtService } from '@infrastructure/security/JwtService';
import { PrismaUserRepository } from '@infrastructure/database/repositories/implementations/PrismaUserRepository';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { prisma } from '@infrastructure/database/prisma-client';
import { ChangePasswordUseCase } from '@application/use-cases/auth/ChangePasswordUseCase';
import { UpdateProfileUseCase } from '@application/use-cases/auth/UpdateProfileUseCase';

export class AuthController {
  private userRepository = new PrismaUserRepository(prisma);
  private passwordService = new BcryptPasswordService();
  private jwtService = new JwtService();

  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const useCase = new RegisterUserUseCase(this.userRepository, this.passwordService);
      const user = await useCase.execute(req.body);

      // Generate token pair
      const tokens = this.jwtService.generateTokenPair({
        userId: user.getId()!,
        email: user.getEmail().getValue(),
        role: user.getRole(),
      });

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail().getValue(),
            username: user.getUsername(),
            role: user.getRole(),
          },
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login existing user
   * POST /api/v1/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const useCase = new LoginUserUseCase(this.userRepository, this.passwordService);

      // DTO mapping (clean contract)
    const { emailOrUsername, email, username, password } = req.body;

    const identifier = emailOrUsername ?? email ?? username;

    if (!identifier || !password) {
      res.status(400).json({
        status: 'error',
        message: 'emailOrUsername (or email/username) and password are required',
      });
      return;
    }
      const { user } = await useCase.execute({
      emailOrUsername: identifier,
      password,
    });

      // Generate token pair
      const tokens = this.jwtService.generateTokenPair({
        userId: user.getId()!,
        email: user.getEmail().getValue(),
        role: user.getRole(),
      });

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail().getValue(),
            username: user.getUsername(),
            role: user.getRole(),
          },
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh access token using refresh token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          status: 'error',
          message: 'Refresh token is required',
        });
        return;
      }

      // Verify refresh token
      const decoded = this.jwtService.verifyRefreshToken(refreshToken);

      // Get fresh user data
      const useCase = new RefreshTokenUseCase(this.userRepository);
      const user = await useCase.execute({ userId: decoded.userId });

      // Generate new token pair
      const tokens = this.jwtService.generateTokenPair({
        userId: user.getId()!,
        email: user.getEmail().getValue(),
        role: user.getRole(),
      });

      res.status(200).json({
        status: 'success',
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current authenticated user
   * GET /api/v1/auth/me
   */
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User is attached by authenticate middleware
      const user = await this.userRepository.findById(req.user!.id);

      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail().getValue(),
            username: user.getUsername(),
            role: user.getRole(),
            phone: user.getPhone(),
            photo: user.getPhoto(),
            active: user.isActive(),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
 * Change password
 * POST /api/v1/auth/change-password
 */
changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const useCase = new ChangePasswordUseCase(this.userRepository, this.passwordService);
    await useCase.execute({
      userId: req.user!.id,
      ...req.body,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile
 * PATCH /api/v1/auth/profile
 */
updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const useCase = new UpdateProfileUseCase(this.userRepository);
    await useCase.execute({
      userId: req.user!.id,
      ...req.body,
    });

    // Get updated user
    const user = await this.userRepository.findById(req.user!.id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user!.getId(),
          name: user!.getName(),
          email: user!.getEmail().getValue(),
          username: user!.getUsername(),
          role: user!.getRole(),
          phone: user!.getPhone(),
          photo: user!.getPhoto(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

}
