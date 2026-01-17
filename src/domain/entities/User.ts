import { Email } from '@domain/value-objects/Email';
import { ValidationError } from '@shared/errors';

export type UserRole = 'customer' | 'tour-guide' | 'admin';

export interface UserProps {
  id?: string;
  name: string;
  email: Email;
  password: string; // Hashed password
  role: UserRole;
  photo?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly id?: string;
  private name: string;
  private email: Email;
  private password: string;
  private role: UserRole;
  private photo?: string;
  private active: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserProps) {
    this.validate(props);

    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.photo = props.photo;
    this.active = props.active;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private validate(props: UserProps): void {
    const errors: Record<string, string[]> = {};

    // Name validation
    if (!props.name || props.name.trim().length === 0) {
      errors.name = ['Name is required'];
    } else if (props.name.length < 2) {
      errors.name = ['Name must be at least 2 characters'];
    } else if (props.name.length > 100) {
      errors.name = ['Name must not exceed 100 characters'];
    }

    // Email validation (Email value object validates itself)
    if (!props.email) {
      errors.email = ['Email is required'];
    }

    // Password validation (basic - should be validated before hashing)
    if (!props.password || props.password.length === 0) {
      errors.password = ['Password is required'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('User validation failed', errors);
    }
  }

  // Getters
  getId(): string | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getRole(): UserRole {
    return this.role;
  }

  getPhoto(): string | undefined {
    return this.photo;
  }

  isActive(): boolean {
    return this.active;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  // Business methods
  updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new ValidationError('Invalid name', {
        name: ['Name must be at least 2 characters'],
      });
    }
    this.name = newName;
    this.updatedAt = new Date();
  }

  updateEmail(newEmail: Email): void {
    this.email = newEmail;
    this.updatedAt = new Date();
  }

  updatePassword(newHashedPassword: string): void {
    if (!newHashedPassword || newHashedPassword.length === 0) {
      throw new ValidationError('Invalid password', {
        password: ['Password is required'],
      });
    }
    this.password = newHashedPassword;
    this.updatedAt = new Date();
  }

  updatePhoto(photoUrl: string): void {
    this.photo = photoUrl;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.active = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.active = true;
    this.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isTourGuide(): boolean {
    return this.role === 'tour-guide';
  }

  isCustomer(): boolean {
    return this.role === 'customer';
  }

  canManageTours(): boolean {
    return this.role === 'admin' || this.role === 'tour-guide';
  }
}
