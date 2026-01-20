import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';

export interface IUserRepository {
  // Create
  save(user: User): Promise<User>;

  // Read
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByRole(role: 'customer' | 'tour-guide' | 'admin'): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;

  // Update
  update(user: User): Promise<User>;

  // Delete
  delete(id: string): Promise<void>;

  // Aggregations
  countUsers(): Promise<number>;
  countByRole(role: 'customer' | 'tour-guide' | 'admin'): Promise<number>;
}
