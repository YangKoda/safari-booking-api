import { ValidationError } from '@shared/errors';

export interface UpdateTourDTO {
  name?: string;
  location?: string;
  description?: string;
  priceAmount?: number;
  priceCurrency?: string;
  duration?: number;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  maxGroupSize?: number;
  images?: string[];
  startDates?: string[];
  featured?: boolean;
}

export class UpdateTourDTOValidator {
  static validate(dto: UpdateTourDTO): void {
    const errors: Record<string, string[]> = {};

    // At least one field must be provided
    if (Object.keys(dto).length === 0) {
      errors.general = ['At least one field must be provided for update'];
    }

    // Name validation (if provided)
    if (dto.name !== undefined) {
      if (!dto.name || dto.name.trim().length === 0) {
        errors.name = ['Name cannot be empty'];
      }
      if (dto.name && dto.name.length > 200) {
        errors.name = ['Name must be 200 characters or less'];
      }
    }

    // Location validation (if provided)
    if (dto.location !== undefined) {
      if (!dto.location || dto.location.trim().length === 0) {
        errors.location = ['Location cannot be empty'];
      }
    }

    // Description validation (if provided)
    if (dto.description !== undefined) {
      if (!dto.description || dto.description.trim().length === 0) {
        errors.description = ['Description cannot be empty'];
      }
      if (dto.description && dto.description.length > 2000) {
        errors.description = ['Description must be 2000 characters or less'];
      }
    }

    // Price validation (if provided)
    if (dto.priceAmount !== undefined) {
      if (dto.priceAmount <= 0) {
        errors.priceAmount = ['Price must be greater than 0'];
      }
    }

    // Currency validation (if price is updated)
    if (dto.priceAmount !== undefined && !dto.priceCurrency) {
      errors.priceCurrency = ['Currency is required when updating price'];
    }

    // Duration validation (if provided)
    if (dto.duration !== undefined) {
      if (dto.duration <= 0) {
        errors.duration = ['Duration must be at least 1 day'];
      }
      if (dto.duration > 365) {
        errors.duration = ['Duration cannot exceed 365 days'];
      }
    }

    // Difficulty validation (if provided)
    if (dto.difficulty !== undefined) {
      const validDifficulties = ['easy', 'moderate', 'challenging'];
      if (!validDifficulties.includes(dto.difficulty)) {
        errors.difficulty = ['Difficulty must be easy, moderate, or challenging'];
      }
    }

    // Capacity validation (if provided)
    if (dto.maxGroupSize !== undefined) {
      if (dto.maxGroupSize <= 0) {
        errors.maxGroupSize = ['Maximum capacity must be at least 1'];
      }
      if (dto.maxGroupSize > 100) {
        errors.maxGroupSize = ['Maximum capacity cannot exceed 100'];
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Tour update validation failed', errors);
    }
  }
}
