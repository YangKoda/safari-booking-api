import { ValidationError } from '@shared/errors';

export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.value = this.validate(email);
  }

  private validate(email: string): string {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      throw new ValidationError('Invalid email format', {
        email: ['Must be a valid email address'],
      });
    }

    if (trimmed.length > 255) {
      throw new ValidationError('Email too long', {
        email: ['Email must be less than 255 characters'],
      });
    }

    return trimmed;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
