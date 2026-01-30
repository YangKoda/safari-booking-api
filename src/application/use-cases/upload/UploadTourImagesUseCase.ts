import { IUploadTourImagesUseCase, UploadTourImagesDTO } from '@application/ports/input/IUploadTourImagesUseCase';
import { IFileUploadService } from '@application/ports/output/IFileUploadService';
import { ITourRepository } from '@domain/repositories/ITourRepository';
import { AppError } from '@shared/errors';

export class UploadTourImagesUseCase implements IUploadTourImagesUseCase {
  constructor(
    private readonly tourRepository: ITourRepository,
    private readonly uploadService: IFileUploadService
  ) {}

  async execute(dto: UploadTourImagesDTO): Promise<string[]> {
    const { tourId, files } = dto;

    // Verify tour exists
    const tour = await this.tourRepository.findById(tourId);
    if (!tour) {
      throw new AppError('Tour not found', 404);
    }

    // Upload all images
    const uploadPromises = files.map((file) =>
      this.uploadService.uploadImage({
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        folder: 'tours',
      })
    );

    const uploadedFiles = await Promise.all(uploadPromises);

    // Return URLs
    return uploadedFiles.map((file) => file.url);
  }
}
