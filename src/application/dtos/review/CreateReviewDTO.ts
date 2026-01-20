export interface CreateReviewDTO {
  tourId: string;
  userId: string;
  rating: number;
  comment: string;
}

export class CreateReviewDTOValidator {
  static validate(dto: CreateReviewDTO): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    // Tour ID validation
    if (!dto.tourId || dto.tourId.trim().length === 0) {
      errors.tourId = ['Tour ID is required'];
    }

    // User ID validation
    if (!dto.userId || dto.userId.trim().length === 0) {
      errors.userId = ['User ID is required'];
    }

    // Rating validation
    if (dto.rating === undefined || dto.rating === null) {
      errors.rating = ['Rating is required'];
    } else if (!Number.isInteger(dto.rating)) {
      errors.rating = ['Rating must be a whole number'];
    } else if (dto.rating < 1 || dto.rating > 5) {
      errors.rating = ['Rating must be between 1 and 5 stars'];
    }

    // Comment validation
    if (!dto.comment || dto.comment.trim().length === 0) {
      errors.comment = ['Comment is required'];
    } else if (dto.comment.trim().length < 10) {
      errors.comment = ['Comment must be at least 10 characters'];
    } else if (dto.comment.length > 500) {
      errors.comment = ['Comment must not exceed 500 characters'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
