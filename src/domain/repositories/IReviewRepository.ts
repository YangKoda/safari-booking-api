import { Review } from '@domain/entities/Review';

export interface IReviewRepository {
  save(review: Review): Promise<Review>;

  findById(id: string): Promise<Review | null>;
  findAll(): Promise<Review[]>;
  findByTourId(tourId: string): Promise<Review[]>;
  findByUserId(userId: string): Promise<Review[]>;
  findByTourAndUser(tourId: string, userId: string): Promise<Review | null>;

  update(review: Review): Promise<Review>;

  delete(id: string): Promise<void>;

  countReviews(): Promise<number>;
  countByTourId(tourId: string): Promise<number>;
  findTopRated(limit: number): Promise<Review[]>;
}
