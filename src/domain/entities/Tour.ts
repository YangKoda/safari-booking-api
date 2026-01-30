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
  featured?: boolean;
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
  private featured: boolean;
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
    this.featured = props.featured || false;
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

  getFeatured(): boolean {
    return this.featured;
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

  getPricePerDay(): Money {
    return this.price.multiply(1 / this.duration);
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

    updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Tour name cannot be empty', {
        name: ['Tour name cannot be empty'],
      });
    }

    if (name.trim().length < 3) {
      throw new ValidationError('Tour name too short', {
        name: ['Tour name must be at least 3 characters'],
      });
    }

    this.name = name.trim();
    this.updatedAt = new Date();
  }

  updateLocation(location: string): void {
    if (!location || location.trim().length === 0) {
      throw new ValidationError('Tour location cannot be empty', {
        location: ['Tour location cannot be empty'],
      });
    }

    this.startLocation = {
      ...this.startLocation,
      description: location.trim(),
    };

    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new ValidationError('Tour description cannot be empty', {
        description: ['Tour description cannot be empty'],
      });
    }

    if (description.trim().length < 10) {
      throw new ValidationError('Description too short', {
        description: ['Description must be at least 10 characters'],
      });
    }

    this.description = description.trim();
    this.updatedAt = new Date();
  }

    updateSummary(summary: string): void {
    if (!summary || summary.trim().length === 0) {
      throw new ValidationError('Summary cannot be empty', {
        summary: ['Summary cannot be empty'],
      });
    }

    this.summary = summary.trim();
    this.updatedAt = new Date();
  }

    updateDuration(duration: number): void {
    if (duration <= 0) {
      throw new ValidationError('Tour duration must be greater than 0', {
        duration: ['Duration must be greater than 0'],
      });
    }

    this.duration = duration;
    this.updatedAt = new Date();
  }

  updateDifficulty(difficulty: TourDifficulty): void {
    this.difficulty = difficulty;
    this.updatedAt = new Date();
  }

    updateMaxGroupSize(maxGroupSize: number): void {
    if (maxGroupSize <= 0) {
      throw new ValidationError('Max group size must be greater than 0', {
        maxGroupSize: ['Max group size must be greater than 0'],
      });
    }

    this.maxGroupSize = maxGroupSize;
    this.updatedAt = new Date();
  }


  updateImages(images: string[]): void {
    this.images = images;
    this.updatedAt = new Date();
  }

    updateStartDates(startDates: Date[]): void {
      if (!startDates || startDates.length === 0) {
        throw new ValidationError('At least one start date is required', {
          startDates: ['At least one start date is required'],
        });
      }

    const now = new Date();
    const hasPast = startDates.some((d) => d < now);

    if (hasPast) {
      throw new ValidationError('Start dates cannot include past dates', {
        startDates: ['All start dates must be in the future'],
      });
    }

    this.startDates = startDates;
    this.updatedAt = new Date();
  }

    updateFeatured(featured: boolean): void {
      this.featured = featured;
      this.updatedAt = new Date();
    }


}
