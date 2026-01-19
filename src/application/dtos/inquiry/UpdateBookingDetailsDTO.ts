export interface UpdateBookingDetailsDTO {
  participants?: number;
  startDate?: string; // ISO 8601 format
  endDate?: string;   // ISO 8601 format
  specialRequests?: string;
  rescheduleReason?: string; // Required when changing dates on confirmed booking
}

export class UpdateBookingDetailsDTOValidator {
  static validate(dto: UpdateBookingDetailsDTO): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    // At least one field must be provided
    if (
      dto.participants === undefined &&
      dto.startDate === undefined &&
      dto.endDate === undefined &&
      dto.specialRequests === undefined
    ) {
      errors.general = ['At least one field must be provided for update'];
      return { isValid: false, errors };
    }

    // Participants validation
    if (dto.participants !== undefined) {
      if (dto.participants <= 0) {
        errors.participants = ['Number of participants must be greater than 0'];
      }
      if (dto.participants > 50) {
        errors.participants = ['Number of participants cannot exceed 50'];
      }
    }

    // Date validation - both dates must be provided together
    if ((dto.startDate && !dto.endDate) || (!dto.startDate && dto.endDate)) {
      errors.dateRange = ['Both start date and end date must be provided when updating dates'];
    }

    // Start date validation
    if (dto.startDate) {
      const startDate = new Date(dto.startDate);
      if (isNaN(startDate.getTime())) {
        errors.startDate = ['Invalid start date format. Use ISO 8601 (YYYY-MM-DD)'];
      } else if (startDate < new Date()) {
        errors.startDate = ['Start date cannot be in the past'];
      }
    }

    // End date validation
    if (dto.endDate) {
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

    // Special requests validation
    if (dto.specialRequests !== undefined && dto.specialRequests.length > 1000) {
      errors.specialRequests = ['Special requests cannot exceed 1000 characters'];
    }

    // Reschedule reason validation
    if (dto.rescheduleReason !== undefined && dto.rescheduleReason.length > 500) {
      errors.rescheduleReason = ['Reschedule reason cannot exceed 500 characters'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
