import { Request, Response, NextFunction } from 'express';
import { S3UploadService } from '@infrastructure/storage/S3UploadService';
import { PrismaTourRepository } from '@infrastructure/database/repositories/implementations/PrismaTourRepository';
import { PrismaUserRepository } from '@infrastructure/database/repositories/implementations/PrismaUserRepository';
import { UploadTourImagesUseCase } from '@application/use-cases/upload/UploadTourImagesUseCase';
import { UploadUserAvatarUseCase } from '@application/use-cases/upload/UploadUserAvatarUseCase';
import { prisma } from '@infrastructure/database/prisma-client';
import { AppError } from '@shared/errors';

export class UploadController {
  private uploadService = new S3UploadService();
  private tourRepository = new PrismaTourRepository(prisma);
  private userRepository = new PrismaUserRepository(prisma);

  /**
   * Upload tour images
   * POST /api/v1/upload/tours/:tourId/images
   */
  uploadTourImages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tourId = req.params.tourId as string;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      const useCase = new UploadTourImagesUseCase(
        this.tourRepository,
        this.uploadService
      );

      const urls = await useCase.execute({ tourId, files });

      res.status(200).json({
        status: 'success',
        data: {
          urls,
          count: urls.length,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload user avatar
   * POST /api/v1/upload/users/avatar
   */
  uploadUserAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id; // From authenticate middleware
      const file = req.file;

      if (!file) {
        throw new AppError('No file uploaded', 400);
      }

      const useCase = new UploadUserAvatarUseCase(
        this.userRepository,
        this.uploadService
      );

      const url = await useCase.execute({ userId, file });

      res.status(200).json({
        status: 'success',
        data: {
          url,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
