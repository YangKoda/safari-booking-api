import { PrismaClient } from '@prisma/client';
import { IReviewRepository } from '@domain/repositories/IReviewRepository';
import { Review } from '@domain/entities/Review';
import { ReviewMapper } from '../mappers/ReviewMapper';
import { NotFoundError } from '@shared/errors';

export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // -------------------
  // Create
  // -------------------
  async save(review: Review): Promise<Review> {
    const id = review.getId();

    const data = {
      rating: review.getRating().getValue(),
      comment: review.getComment(),
      tourId: review.getTourId(),
      userId: review.getUserId(),
    };

    const saved = id
      ? await this.prisma.review.upsert({
          where: { id },
          create: { id, ...data },
          update: { ...data },
        })
      : await this.prisma.review.create({
          data,
        });

    return ReviewMapper.toDomain(saved);
  }

  // -------------------
  // Read
  // -------------------
  async findById(id: string): Promise<Review | null> {
    const r = await this.prisma.review.findUnique({ where: { id } });
    if (!r) return null;
    return ReviewMapper.toDomain(r);
  }

  async findAll(): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map(ReviewMapper.toDomain);
  }

  async findByTourId(tourId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { tourId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map(ReviewMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map(ReviewMapper.toDomain);
  }

  async findByTourAndUser(tourId: string, userId: string): Promise<Review | null> {
    const review = await this.prisma.review.findFirst({
      where: { tourId, userId },
    });

    if (!review) return null;
    return ReviewMapper.toDomain(review);
  }

  // -------------------
  // Update
  // -------------------
  async update(review: Review): Promise<Review> {
    const id = review.getId();
    if (!id) throw new Error('Review ID is required for update');

    const exists = await this.findById(id);
    if (!exists) throw new NotFoundError(`Review with ID ${id} not found`);

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        rating: review.getRating().getValue(),
        comment: review.getComment(),
      },
    });

    return ReviewMapper.toDomain(updated);
  }

  // -------------------
  // Delete
  // -------------------
  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({ where: { id } });
  }

  // -------------------
  // Aggregations
  // -------------------
  async countReviews(): Promise<number> {
    return this.prisma.review.count();
  }

  async countByTourId(tourId: string): Promise<number> {
    return this.prisma.review.count({ where: { tourId } });
  }

  async findTopRated(limit: number): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      take: limit,
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
    });

    return reviews.map(ReviewMapper.toDomain);
  }
}
