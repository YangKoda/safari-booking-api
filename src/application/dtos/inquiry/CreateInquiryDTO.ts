import { DateRange } from "@domain/value-objects/DateRange";

export interface CreateInquiryDTO {
  tourId: string;
  userId: string;
  // Customer snapshot (REQUIRED by InquiryProps)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  participants: number;
  preferredDateRange: DateRange;
  startDate: string; // ISO 8601 format: "2026-03-15"
  endDate: string;   // ISO 8601 format: "2026-03-20"
  specialRequests?: string;
}

export class CreateInquiryDTOValidator {
  static validate(dto: CreateInquiryDTO): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    // Tour ID validation
    if (!dto.tourId || dto.tourId.trim().length === 0) {
      errors.tourId = ['Tour ID is required'];
    }

    // User ID validation
    if (!dto.userId || dto.userId.trim().length === 0) {
      errors.userId = ['User ID is required'];
    }

    // Participants validation
    if (!dto.participants || dto.participants <= 0) {
      errors.participants = ['Number of participants must be greater than 0'];
    }

    if (dto.participants > 50) {
      errors.participants = ['Number of participants cannot exceed 50'];
    }

    // Start date validation
    if (!dto.startDate || dto.startDate.trim().length === 0) {
      errors.startDate = ['Start date is required'];
    } else {
      const startDate = new Date(dto.startDate);
      if (isNaN(startDate.getTime())) {
        errors.startDate = ['Invalid start date format. Use ISO 8601 (YYYY-MM-DD)'];
      } else if (startDate < new Date()) {
        errors.startDate = ['Start date cannot be in the past'];
      }
    }

    // End date validation
    if (!dto.endDate || dto.endDate.trim().length === 0) {
      errors.endDate = ['End date is required'];
    } else {
      const endDate = new Date(dto.endDate);
      if (isNaN(endDate.getTime())) {
        errors.endDate = ['Invalid end date format. Use ISO 8601 (YYYY-MM-DD)'];
      }

      // Validate end date is after start date
      if (dto.startDate) {
        const startDate = new Date(dto.startDate);
        if (!isNaN(startDate.getTime()) && endDate <= startDate) {
          errors.endDate = ['End date must be after start date'];
        }
      }
    }

    // Special requests validation (optional, but with max length)
    if (dto.specialRequests && dto.specialRequests.length > 1000) {
      errors.specialRequests = ['Special requests cannot exceed 1000 characters'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
