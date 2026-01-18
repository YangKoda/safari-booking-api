import { ValidationError } from '@shared/errors';

export class DateRange {
  private readonly startDate: Date;
  private readonly endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    this.validateDates(startDate, endDate);
    this.startDate = startDate;
    this.endDate = endDate;
  }

  private validateDates(startDate: Date, endDate: Date): void {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new ValidationError('Invalid start date', {
        startDate: ['Start date must be a valid date'],
      });
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid end date', {
        endDate: ['End date must be a valid date'],
      });
    }

    if (endDate <= startDate) {
      throw new ValidationError('Invalid date range', {
        dateRange: ['End date must be after start date'],
      });
    }
  }

  getStartDate(): Date {
    return new Date(this.startDate);
  }

  getEndDate(): Date {
    return new Date(this.endDate);
  }

  getDurationInDays(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isInPast(): boolean {
    return this.endDate < new Date();
  }

  isInFuture(): boolean {
    return this.startDate > new Date();
  }

  isCurrent(): boolean {
    const now = new Date();
    return this.startDate <= now && now <= this.endDate;
  }

  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && other.startDate <= this.endDate;
  }

  contains(date: Date): boolean {
    return this.startDate <= date && date <= this.endDate;
  }

  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }

  toString(): string {
    return `${this.startDate.toISOString().split('T')[0]} to ${this.endDate.toISOString().split('T')[0]}`;
  }
}
