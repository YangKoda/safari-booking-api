export interface UploadReviewImagesDTO {
  reviewId: string;
  userId: string;  // Must be the review owner
  files: Express.Multer.File[];
}

export interface IUploadReviewImagesUseCase {
  execute(dto: UploadReviewImagesDTO): Promise<string[]>;
}
