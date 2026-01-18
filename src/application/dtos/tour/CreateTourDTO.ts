export interface CreateTourDTO {
  name: string;
  description: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  priceAmount: number;
  priceCurrency: string;
  summary: string;
  imageCover: string;
  images: string[];
  startDates: string[]; // ISO 8601 format
  startLocation: {
    description: string;
    coordinates: [number, number];
    address: string;
  };
  locations: Array<{
    description: string;
    coordinates: [number, number];
    day: number;
  }>;
  guides: string[];
}

export class CreateTourDTOValidator {
  static validate(dto: CreateTourDTO): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    if (!dto.name || dto.name.trim().length === 0) {
      errors.name = ['Tour name is required'];
    } else if (dto.name.length < 3) {
      errors.name = ['Tour name must be at least 3 characters'];
    }

    if (!dto.description || dto.description.trim().length < 10) {
      errors.description = ['Description must be at least 10 characters'];
    }

    if (!dto.duration || dto.duration <= 0) {
      errors.duration = ['Duration must be greater than 0'];
    }

    if (!dto.maxGroupSize || dto.maxGroupSize <= 0) {
      errors.maxGroupSize = ['Max group size must be greater than 0'];
    }

    if (!dto.difficulty || !['easy', 'medium', 'difficult'].includes(dto.difficulty)) {
      errors.difficulty = ['Difficulty must be easy, medium, or difficult'];
    }

    if (!dto.priceAmount || dto.priceAmount <= 0) {
      errors.priceAmount = ['Price must be greater than 0'];
    }

    if (!dto.priceCurrency || !['USD', 'EUR', 'GBP', 'KES'].includes(dto.priceCurrency)) {
      errors.priceCurrency = ['Invalid currency code'];
    }

    if (!dto.summary || dto.summary.trim().length === 0) {
      errors.summary = ['Summary is required'];
    }

    if (!dto.imageCover || dto.imageCover.trim().length === 0) {
      errors.imageCover = ['Cover image is required'];
    }

    if (!Array.isArray(dto.startDates) || dto.startDates.length === 0) {
      errors.startDates = ['At least one start date is required'];
    }

    if (!dto.startLocation) {
      errors.startLocation = ['Start location is required'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
