import { Money } from '@domain/value-objects/Money';
import { Rating } from '@domain/value-objects/Rating';
import { DateRange } from '@domain/value-objects/DateRange';
import { ValidationError } from '@shared/errors';

export type TourDifficulty = 'easy' | 'medium' | 'difficult';

export interface TourProps {
  id?: string;
  name: string;
  slug: string;
  description: string;
  duration: number; // in days
  maxGroupSize: number;
  difficulty: TourDifficulty;
  price: Money;
  summary: string;
  imageCover: string;
  images: string[];
  startDates: Date[];
  startLocation: {
    description: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  locations: Array<{
    description: string;
    coordinates: [number, number];
    day: number;
  }>;
  guides: string[]; // User IDs
  ratingsAverage?: number;
  ratingsQuantity?: number;
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tour {
  private readonly id?: string;
  private name: string;
  private slug: string;
  private description: string;
  private duration: number;
  private maxGroupSize: number;
  private difficulty: TourDifficulty;
  private price: Money;
  private summary: string;
  private imageCover: string;
  private images: string[];
  private startDates: Date[];
  private startLocation: TourProps['startLocation'];
  private locations: TourProps['locations'];
  private guides: string[];
  private ratingsAverage: number;
  private ratingsQuantity: number;
  private viewCount: number;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: TourProps) {
    this.validate(props);

    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.duration = props.duration;
    this.maxGroupSize = props.maxGroupSize;
    this.difficulty = props.difficulty;
    this.price = props.price;
    this.summary = props.summary;
    this.imageCover = props.imageCover;
    this.images = props.images;
    this.startDates = props.startDates;
    this.startLocation = props.startLocation;
    this.locations = props.locations;
    this.guides = props.guides;
    this.ratingsAverage = props.ratingsAverage || 0;
    this.ratingsQuantity = props.ratingsQuantity || 0;
    this.viewCount = props.viewCount || 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private validate(props: TourProps): void {
    const errors: Record<string, string[]> = {};

    // Name validation
    if (!props.name || props.name.trim().length === 0) {
      errors.name = ['Tour name is required'];
    } else if (props.name.length < 3) {
      errors.name = ['Tour name must be at least 3 characters'];
    } else if (props.name.length > 100) {
      errors.name = ['Tour name must not exceed 100 characters'];
    }

    // Description validation
    if (!props.description || props.description.trim().length === 0) {
      errors.description = ['Tour description is required'];
    } else if (props.description.length < 10) {
      errors.description = ['Description must be at least 10 characters'];
    }

    // Duration validation
    if (props.duration <= 0) {
      errors.duration = ['Duration must be greater than 0'];
    }

    // Max group size validation
    if (props.maxGroupSize <= 0) {
      errors.maxGroupSize = ['Max group size must be greater than 0'];
    }

    // Price validation (Money object validates itself)
    if (!props.price) {
      errors.price = ['Price is required'];
    }

    // Start dates validation
    if (!props.startDates || props.startDates.length === 0) {
      errors.startDates = ['At least one start date is required'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Tour validation failed', errors);
    }
  }

  // Getters
  getId(): string | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getSlug(): string {
  return this.slug;
}

getViewCount(): number {
  return this.viewCount;
}

  getDescription(): string {
    return this.description;
  }

  getDuration(): number {
    return this.duration;
  }

  getMaxCapacity(): number {
    return this.maxGroupSize;
  }

  getMaxGroupSize(): number {
    return this.maxGroupSize;
  }

  getDifficulty(): TourDifficulty {
    return this.difficulty;
  }

  getPrice(): Money {
    return this.price;
  }

  getSummary(): string {
    return this.summary;
  }

  getImageCover(): string {
    return this.imageCover;
  }

  getImages(): string[] {
    return [...this.images];
  }

  getStartDates(): Date[] {
    return [...this.startDates];
  }

  getStartLocation(): TourProps['startLocation'] {
    return { ...this.startLocation };
  }

  getLocations(): TourProps['locations'] {
    return [...this.locations];
  }

  getGuides(): string[] {
    return [...this.guides];
  }

  getRatingsAverage(): number {
    return this.ratingsAverage;
  }

  getRatingsQuantity(): number {
    return this.ratingsQuantity;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  // Business methods
  updatePrice(newPrice: Money): void {
    this.price = newPrice;
    this.updatedAt = new Date();
  }

  updateRatings(average: number, quantity: number): void {
    this.ratingsAverage = average;
    this.ratingsQuantity = quantity;
    this.updatedAt = new Date();
  }

  addStartDate(date: Date): void {
    if (date < new Date()) {
      throw new ValidationError('Cannot add past start dates', {
        startDate: ['Start date must be in the future'],
      });
    }
    this.startDates.push(date);
    this.updatedAt = new Date();
  }

  isAvailable(): boolean {
    const now = new Date();
    return this.startDates.some((date) => date > now);
  }

  incrementViewCount(): void {
    this.viewCount += 1;
    this.updatedAt = new Date();
  }


  getPricePerDay(): Money {
    return this.price.multiply(1 / this.duration);
  }
}
