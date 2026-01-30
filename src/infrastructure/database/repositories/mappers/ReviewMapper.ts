import { Review, ReviewProps } from '@domain/entities/Review';
import { Rating } from '@domain/value-objects/Rating';
import { Review as PrismaReview } from '@prisma/client';

export class ReviewMapper {
  static toDomain(prisma: PrismaReview): Review {
    const reviewProps: ReviewProps = {
      id: prisma.id,
      rating: new Rating(prisma.rating),
      comment: prisma.comment,
      images: prisma.images || [],
      tourId: prisma.tourId,
      userId: prisma.userId,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };

    return new Review(reviewProps);
  }

  static toPrisma(review: Review): Omit<PrismaReview, 'createdAt' | 'updatedAt'> {
    const reviewId = review.getId();
    if (!reviewId) throw new Error('Review ID required for Prisma conversion');

    return {
      id: reviewId,
      rating: review.getRating().getValue(),
      comment: review.getComment(),
      images: review.getImages(),
      tourId: review.getTourId(),
      userId: review.getUserId(),
    };
  }
}
