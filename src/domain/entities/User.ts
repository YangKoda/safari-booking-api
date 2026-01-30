import { Email } from '@domain/value-objects/Email';
import { ValidationError } from '@shared/errors';


export type DomainUserRole  = 'customer' | 'tour-guide' | 'admin';

export interface UserProps {
  id?: string;
  name: string;
  email: Email;
  username?: string;
  password: string; // Hashed password
  role: DomainUserRole ;
  photo?: string;
  phone?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  passwordChangedAt?: Date;
}

export class User {
  private readonly id?: string;
  private name: string;
  private email: Email;
  private password: string;
  private role: DomainUserRole ;
  private photo?: string;
  private phone?: string;
  private active: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private passwordChangedAt?: Date;
  private username?: string;

  constructor(props: UserProps) {
    this.validate(props);

    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.photo = props.photo;
    this.phone = props.phone;
    this.active = props.active;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
    this.passwordChangedAt = props.passwordChangedAt;
    this.username = props.username;
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

    // Role validation
    const validRoles: DomainUserRole [] = ['customer', 'tour-guide', 'admin'];
      if (!validRoles.includes(props.role)) {
      errors.role = ['Invalid role'];
      }

    // Username validation
    if (props.username !== undefined) {
      if (props.username.length < 3) {
        errors.username = ['Username must be at least 3 characters'];
      } else if (props.username.length > 30) {
        errors.username = ['Username must not exceed 30 characters'];
      } else if (!/^[a-zA-Z0-9_]+$/.test(props.username)) {
        errors.username = ['Username can only contain letters, numbers, and underscores'];
      }
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

  getUsername(): string | undefined {
    return this.username;
  }

  getPassword(): string {
    return this.password;
  }

  getRole(): DomainUserRole  {
    return this.role;
  }

  getPhoto(): string | undefined {
    return this.photo;
  }

  getPhone(): string | undefined {
  return this.phone;
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

  getPasswordChangedAt(): Date | undefined {
  return this.passwordChangedAt ? new Date(this.passwordChangedAt) : undefined;
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

    updateUsername(newUsername: string): void {
    if (newUsername.length < 3 || newUsername.length > 30) {
      throw new ValidationError('Invalid username', {
        username: ['Username must be between 3 and 30 characters'],
      });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      throw new ValidationError('Invalid username', {
        username: ['Username can only contain letters, numbers, and underscores'],
      });
    }
    this.username = newUsername;
    this.updatedAt = new Date();
  }

  updatePassword(newHashedPassword: string): void {
    if (!newHashedPassword || newHashedPassword.length === 0) {
      throw new ValidationError('Invalid password', {
        password: ['Password is required'],
      });
    }
    this.password = newHashedPassword;
    this.passwordChangedAt = new Date();
    this.updatedAt = new Date();
  }

  updatePhone(newPhone: string): void {
  // allow clearing
  if (newPhone.trim() === '') {
    this.phone = undefined;
    this.updatedAt = new Date();
    return;
  }

  if (newPhone.length < 7 || newPhone.length > 20) {
    throw new ValidationError('Invalid phone', {
      phone: ['Phone must be between 7 and 20 characters'],
    });
  }

  this.phone = newPhone;
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

  changedPasswordAfter(jwtTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
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
