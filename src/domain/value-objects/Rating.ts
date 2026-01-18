import { ValidationError } from '@shared/errors';

export class Rating {
  private readonly value: number;

  constructor(rating: number) {
    this.value = this.validate(rating);
  }

  private validate(rating: number): number {
    if (typeof rating !== 'number' || isNaN(rating)) {
      throw new ValidationError('Invalid rating', {
        rating: ['Rating must be a valid number'],
      });
    }

    if (rating < 1 || rating > 5) {
      throw new ValidationError('Invalid rating', {
        rating: ['Rating must be between 1 and 5'],
      });
    }

    return Math.round(rating * 10) / 10;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Rating): boolean {
    return this.value === other.value;
  }

  isGreaterThan(other: Rating): boolean {
    return this.value > other.value;
  }

  toString(): string {
    return `${this.value} / 5`;
  }

  toStars(): string {
    const fullStars = Math.floor(this.value);
    const hasHalfStar = this.value % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '⭐'.repeat(fullStars) +
           (hasHalfStar ? '✨' : '') +
           '☆'.repeat(emptyStars);
  }
}
