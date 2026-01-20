import { IUserRepository } from '@domain/repositories/IUserRepository';
import { PasswordService } from '@domain/services/PasswordService';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { ValidationError } from '@shared/errors';
import type { UserRole } from '@domain/entities/User';

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role?: 'customer' | 'tour-guide'; // Only allow customer/tour-guide registration (not admin)
  phone?: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(dto: RegisterUserDTO): Promise<User> {
    // Validate password confirmation
    if (dto.password !== dto.passwordConfirm) {
      throw new ValidationError('Password validation failed', {
        passwordConfirm: ['Passwords do not match'],
      });
    }

    // Validate password strength
    this.validatePasswordStrength(dto.password);

    // Check if email already exists
    const email = new Email(dto.email);
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Registration failed', {
        email: ['Email already in use'],
      });
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Create user with proper role type
    const userRole: UserRole = dto.role || 'customer';
    const user = new User({
      name: dto.name,
      email,
      password: hashedPassword,
      role: userRole,
      phone: dto.phone,
      active: true,
    });

    // Save to database
    return this.userRepository.save(user);
  }

  private validatePasswordStrength(password: string): void {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (errors.length > 0) {
      throw new ValidationError('Password validation failed', { password: errors });
    }
  }
}
