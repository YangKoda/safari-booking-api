import { IUserRepository } from '@domain/repositories/IUserRepository';
import { PasswordService } from '@domain/services/PasswordService';
import { AppError, ValidationError } from '@shared/errors';

export interface ChangePasswordDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(dto: ChangePasswordDTO): Promise<void> {
    // 1) Find user
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // 2) Verify current password
    const isCurrentPasswordValid = await this.passwordService.compare(
      dto.currentPassword,
      user.getPassword()
    );
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // 3) Validate new password confirmation
    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new ValidationError('Password validation failed', {
        newPasswordConfirm: ['Passwords do not match'],
      });
    }

    // 4) Validate new password strength
    this.validatePasswordStrength(dto.newPassword);

    // 5) Hash and update password
    const hashedPassword = await this.passwordService.hash(dto.newPassword);
    user.updatePassword(hashedPassword);

    // 6) Save to database
    await this.userRepository.update(user);
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
      throw new ValidationError('Password validation failed', { newPassword: errors });
    }
  }
}
