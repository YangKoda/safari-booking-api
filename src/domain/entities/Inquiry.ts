import { DateRange } from '@domain/value-objects/DateRange';
import { ValidationError } from '@shared/errors';
import { Money } from '@domain/value-objects/Money';


export type InquiryStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export interface InquiryProps {
  id?: string;
  tourId: string;
  userId: string;

// Snapshot of customer details at time of inquiry (denormalized for business reasons)
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  participants: number;
  preferredDateRange: DateRange;
  totalPrice: Money; // Calculated from tour price * participants
  specialRequests?: string;
  status: InquiryStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Inquiry {
  private readonly id?: string;
  private tourId: string;
  private userId: string;

  // Customer snapshot fields
  private customerName: string;
  private customerEmail: string;
  private customerPhone: string;

  private participants: number;
  private preferredDateRange: DateRange;
  private totalPrice: Money;
  private specialRequests?: string;
  private status: InquiryStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InquiryProps) {
    this.validate(props);

    this.id = props.id;
    this.tourId = props.tourId;
    this.userId = props.userId;
    this.customerName = props.customerName;
    this.customerEmail = props.customerEmail;
    this.customerPhone = props.customerPhone;
    this.participants = props.participants;
    this.preferredDateRange = props.preferredDateRange;
    this.totalPrice = props.totalPrice;
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

    // Customer details validation
    if (!props.customerName || props.customerName.trim().length === 0) {
      errors.customerName = ['Customer name is required'];
    }

    if (!props.customerEmail || props.customerEmail.trim().length === 0) {
      errors.customerEmail = ['Customer email is required'];
    }

    if (!props.customerPhone || props.customerPhone.trim().length === 0) {
      errors.customerPhone = ['Customer phone is required'];
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

    // Total price validation
    if (!props.totalPrice) {
      errors.totalPrice = ['Total price is required'];
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

  getCustomerName(): string {
    return this.customerName;
  }

  getCustomerEmail(): string {
    return this.customerEmail;
  }

  getCustomerPhone(): string {
    return this.customerPhone;
  }

  getParticipants(): number {
    return this.participants;
  }

  getPreferredDateRange(): DateRange {
    return this.preferredDateRange;
  }

  getTotalPrice(): Money {
    return this.totalPrice;
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

updateBookingDetails(updates: {
    participants?: number;
    preferredDateRange?: DateRange;
    specialRequests?: string;
    rescheduleReason?: string;
  }): void {
    // Check if booking can be modified
    if (this.status === 'completed') {
      throw new ValidationError('Cannot update completed inquiries', {
        status: ['Completed inquiries cannot be modified'],
      });
    }
    if (this.status === 'cancelled') {
      throw new ValidationError('Cannot update cancelled inquiries', {
        status: ['Cancelled inquiries cannot be modified'],
      });
    }

    // Validate participants if provided
    if (updates.participants !== undefined) {
      if (updates.participants <= 0) {
        throw new ValidationError('Invalid participant count', {
          participants: ['Number of participants must be greater than 0'],
        });
      }
      this.participants = updates.participants;
    }

    // Validate and update date range if provided
    if (updates.preferredDateRange) {
      if (updates.preferredDateRange.isInPast()) {
        throw new ValidationError('Cannot update to past dates', {
          dateRange: ['Cannot book tours in the past'],
        });
      }

      // If booking was CONFIRMED and dates are changing, reset to PENDING for re-approval
      if (this.status === 'confirmed' && !this.preferredDateRange.equals(updates.preferredDateRange)) {
        this.status = 'pending';

        // Add reschedule note to special requests
        if (updates.rescheduleReason) {
          const rescheduleNote = `\n[RESCHEDULE REQUEST: ${updates.rescheduleReason}]`;
          this.specialRequests = this.specialRequests
            ? this.specialRequests + rescheduleNote
            : rescheduleNote;
        }
      }

      this.preferredDateRange = updates.preferredDateRange;
    }

    // Update special requests if provided
    if (updates.specialRequests !== undefined) {
      this.specialRequests = updates.specialRequests;
    }

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
  canBeModified(): boolean {
    return this.status === 'pending' || this.status === 'confirmed';
  }
}
