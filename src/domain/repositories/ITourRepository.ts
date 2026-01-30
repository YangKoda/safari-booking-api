import { Tour } from '@domain/entities/Tour';

export interface ITourRepository {
  // Create
  save(tour: Tour): Promise<Tour>;

  // Read
  findById(id: string): Promise<Tour | null>;
  findByName(name: string): Promise<Tour | null>;
  findAll(): Promise<Tour[]>;
  findByDifficulty(difficulty: 'easy' | 'medium' | 'difficult'): Promise<Tour[]>;
  findAvailable(): Promise<Tour[]>;

  // Update
  update(tour: Tour): Promise<Tour>;

  // Delete
  delete(id: string): Promise<void>;

  // Aggregations
  countTours(): Promise<number>;
  findTopRated(limit: number): Promise<Tour[]>;

  search(dto: {
  query?: string;
  difficulty?: 'easy' | 'medium' | 'difficult';
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  maxGroupSize?: number;
  minRatingsAverage?: number;
  startDateFrom?: Date;
  startDateTo?: Date;
  location?: string;
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'priceAmount' | 'ratingsAverage' | 'duration';
  order: 'asc' | 'desc';
}): Promise<{ tours: Tour[]; total: number }>;

}


