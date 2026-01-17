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
}
