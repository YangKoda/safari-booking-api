import { Inquiry } from '@domain/entities/Inquiry';

export interface IInquiryRepository {
  // Create
  save(inquiry: Inquiry): Promise<Inquiry>;

  // Read
  findById(id: string): Promise<Inquiry | null>;
  findByUserId(userId: string): Promise<Inquiry[]>;
  findByTourId(tourId: string): Promise<Inquiry[]>;
  findByStatus(status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<Inquiry[]>;
  findAll(): Promise<Inquiry[]>;

  // Update
  update(inquiry: Inquiry): Promise<Inquiry>;

  // Delete
  delete(id: string): Promise<void>;

  // Aggregations
  countInquiries(): Promise<number>;
  countByStatus(status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<number>;
  findUpcoming(): Promise<Inquiry[]>;
}
