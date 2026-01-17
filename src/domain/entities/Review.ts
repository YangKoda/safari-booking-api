import { Rating } from '@domain/value-objects/Rating';
import { ValidationError } from '@shared/errors';

export interface ReviewProps {
  id?: string;
  tourId: string;
  userId: string;
  rating: Rating;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Review {
  private readonly id?: string;
  private tourId: string;
  private userId: string;
  private rating: Rating;
  private comment: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: ReviewProps) {
    this.validate(props);

    this.id = props.id;
    this.tourId = props.tourId;
    this.userId = props.userId;
    this.rating = props.rating;
    this.comment = props.comment;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private validate(props: ReviewProps): void {
    const errors: Record<string, string[]> = {};

    // Tour ID validation
    if (!props.tourId || props.tourId.trim().length === 0) {
      errors.tourId = ['Tour ID is required'];
    }

    // User ID validation
    if (!props.userId || props.userId.trim().length === 0) {
      errors.userId = ['User ID is required'];
    }

    // Rating validation (Rating value object validates itself)
    if (!props.rating) {
      errors.rating = ['Rating is required'];
    }

    // Comment validation
    if (!props.comment || props.comment.trim().length === 0) {
      errors.comment = ['Comment is required'];
    } else if (props.comment.length < 10) {
      errors.comment = ['Comment must be at least 10 characters'];
    } else if (props.comment.length > 500) {
      errors.comment = ['Comment must not exceed 500 characters'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Review validation failed', errors);
    }
  }

  // Getters
  getId(): string | undefined {
    return this.id;
  }

  getTourId(): string {
    return this.tourId;
  }

  getUserId(): string {
    return this.userId;
  }

  getRating(): Rating {
    return this.rating;
  }

  getComment(): string {
    return this.comment;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  // Business methods
  updateRating(newRating: Rating): void {
    this.rating = newRating;
    this.updatedAt = new Date();
  }

  updateComment(newComment: string): void {
    if (!newComment || newComment.trim().length < 10) {
      throw new ValidationError('Invalid comment', {
        comment: ['Comment must be at least 10 characters'],
      });
    }
    if (newComment.length > 500) {
      throw new ValidationError('Invalid comment', {
        comment: ['Comment must not exceed 500 characters'],
      });
    }
    this.comment = newComment;
    this.updatedAt = new Date();
  }

  isPositive(): boolean {
    return this.rating.getValue() >= 4;
  }

  isNegative(): boolean {
    return this.rating.getValue() <= 2;
  }

  isNeutral(): boolean {
    return this.rating.getValue() === 3;
  }
}
