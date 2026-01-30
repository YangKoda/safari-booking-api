import { IUploadUserAvatarUseCase, UploadUserAvatarDTO } from '@application/ports/input/IUploadUserAvatarUseCase';
import { IFileUploadService } from '@application/ports/output/IFileUploadService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { AppError } from '@shared/errors';

export class UploadUserAvatarUseCase implements IUploadUserAvatarUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly uploadService: IFileUploadService
  ) {}

  async execute(dto: UploadUserAvatarDTO): Promise<string> {
    const { userId, file } = dto;

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete old avatar if exists
    const oldPhoto = user.getPhoto();
    if (oldPhoto && oldPhoto.includes(process.env.AWS_S3_BUCKET || '')) {
      try {
        const oldKey = oldPhoto.split('/').slice(-2).join('/');
        await this.uploadService.deleteFile(oldKey);
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
      }
    }

    // Upload new avatar
    const uploaded = await this.uploadService.uploadImage({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      folder: 'users',
    });

    // Update user photo
    user.updatePhoto(uploaded.url);
    await this.userRepository.update(user);

    return uploaded.url;
  }
}
