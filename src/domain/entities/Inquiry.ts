import { DateRange } from '@domain/value-objects/DateRange';
import { ValidationError } from '@shared/errors';

export type InquiryStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface InquiryProps {
  id?: string;
  tourId: string;
  userId: string;
  participants: number;
  preferredDateRange: DateRange;
  specialRequests?: string;
  status: InquiryStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Inquiry {
  private readonly id?: string;
  private tourId: string;
  private userId: string;
  private participants: number;
  private preferredDateRange: DateRange;
  private specialRequests?: string;
  private status: InquiryStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InquiryProps) {
    this.validate(props);

    this.id = props.id;
    this.tourId = props.tourId;
    this.userId = props.userId;
    this.participants = props.participants;
    this.preferredDateRange = props.preferredDateRange;
    this.specialRequests = props.specialRequests;
    this.status = props.status;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private validate(props: InquiryProps): void {
    const errors: Record<string, string[]> = {};

    // Tour ID validation
    if (!props.tourId || props.tourId.trim().length === 0) {
      errors.tourId = ['Tour ID is required'];
    }

    // User ID validation
    if (!props.userId || props.userId.trim().length === 0) {
      errors.userId = ['User ID is required'];
    }

    // Participants validation
    if (props.participants <= 0) {
      errors.participants = ['Number of participants must be greater than 0'];
    }

    // Date range validation (DateRange value object validates itself)
    if (!props.preferredDateRange) {
      errors.preferredDateRange = ['Preferred date range is required'];
    } else if (props.preferredDateRange.isInPast()) {
      errors.preferredDateRange = ['Cannot book tours in the past'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Inquiry validation failed', errors);
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

  getParticipants(): number {
    return this.participants;
  }

  getPreferredDateRange(): DateRange {
    return this.preferredDateRange;
  }

  getSpecialRequests(): string | undefined {
    return this.specialRequests;
  }

  getStatus(): InquiryStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  // Business methods
  confirm(): void {
    if (this.status === 'cancelled') {
      throw new ValidationError('Cannot confirm cancelled inquiry', {
        status: ['Cancelled inquiries cannot be confirmed'],
      });
    }
    if (this.status === 'completed') {
      throw new ValidationError('Cannot confirm completed inquiry', {
        status: ['Completed inquiries cannot be confirmed again'],
      });
    }
    this.status = 'confirmed';
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this.status === 'completed') {
      throw new ValidationError('Cannot cancel completed inquiry', {
        status: ['Completed inquiries cannot be cancelled'],
      });
    }
    this.status = 'cancelled';
    this.updatedAt = new Date();
  }

  complete(): void {
    if (this.status !== 'confirmed') {
      throw new ValidationError('Only confirmed inquiries can be completed', {
        status: ['Inquiry must be confirmed before completion'],
      });
    }
    this.status = 'completed';
    this.updatedAt = new Date();
  }

  updateParticipants(newCount: number): void {
    if (newCount <= 0) {
      throw new ValidationError('Invalid participant count', {
        participants: ['Number of participants must be greater than 0'],
      });
    }
    if (this.status !== 'pending') {
      throw new ValidationError('Cannot update confirmed or cancelled inquiries', {
        status: ['Only pending inquiries can be updated'],
      });
    }
    this.participants = newCount;
    this.updatedAt = new Date();
  }

  updateSpecialRequests(requests: string): void {
    if (this.status !== 'pending') {
      throw new ValidationError('Cannot update confirmed or cancelled inquiries', {
        status: ['Only pending inquiries can be updated'],
      });
    }
    this.specialRequests = requests;
    this.updatedAt = new Date();
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }
}
