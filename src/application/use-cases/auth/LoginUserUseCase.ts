import { IUserRepository } from '@domain/repositories/IUserRepository';
import { PasswordService } from '@domain/services/PasswordService';
import { Email } from '@domain/value-objects/Email';
import { AppError } from '@shared/errors';
import { User } from '@domain/entities/User';

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(dto: LoginUserDTO): Promise<LoginResult> {
    // 1) Find user by email (Email VO validates the format)
    const email = new Email(dto.email);
    const user = await this.userRepository.findByEmail(email);

    // 2) Ensure user exists
    if (!user) {
      throw new AppError('Incorrect email or password', 401);
    }

    // 3) Compare password (plain vs hashed)
    const passwordMatches = await this.passwordService.compare(dto.password, user.getPassword());
    if (!passwordMatches) {
      throw new AppError('Incorrect email or password', 401);
    }

    // 4) Ensure account is active
    if (!user.isActive()) {
      throw new AppError('Your account has been deactivated. Please contact support.', 401);
    }

    return { user };
  }
}
