import { IUploadReviewImagesUseCase, UploadReviewImagesDTO } from '@application/ports/input/IUploadReviewImagesUseCase';
import { IFileUploadService } from '@application/ports/output/IFileUploadService';
import { IReviewRepository } from '@domain/repositories/IReviewRepository';
import { AppError } from '@shared/errors';

export class UploadReviewImagesUseCase implements IUploadReviewImagesUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly uploadService: IFileUploadService
  ) {}

  async execute(dto: UploadReviewImagesDTO): Promise<string[]> {
    const { reviewId, userId, files } = dto;

    // 1. Find review
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // 2. Verify ownership (users can only upload to their own reviews)
    if (review.getUserId() !== userId) {
      throw new AppError('You can only upload images to your own reviews', 403);
    }

    // 3. Check if adding these images would exceed limit
    const currentImageCount = review.getImages().length;
    const newImageCount = files.length;

    if (currentImageCount + newImageCount > 5) {
      throw new AppError(
        `Cannot upload ${newImageCount} images. Current: ${currentImageCount}, Max: 5`,
        400
      );
    }

    // 4. Upload all images to S3
    const uploadPromises = files.map((file) =>
      this.uploadService.uploadImage({
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        folder: 'reviews',
      })
    );

    const uploadedFiles = await Promise.all(uploadPromises);
    const imageUrls = uploadedFiles.map((file) => file.url);

    // 5. Add images to review
    review.addImages(imageUrls);

    // 6. Save updated review
    await this.reviewRepository.update(review);

    return imageUrls;
  }
}
