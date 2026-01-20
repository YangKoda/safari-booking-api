import { IUserRepository } from '@domain/repositories/IUserRepository';
import { AppError } from '@shared/errors';
import { User } from '@domain/entities/User';

export interface RefreshTokenDTO {
  userId: string;
}

export class RefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RefreshTokenDTO): Promise<User> {
    // 1) Find user by ID
    const user = await this.userRepository.findById(dto.userId);

    // 2) Ensure user still exists
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    // 3) Ensure account is still active
    if (!user.isActive()) {
      throw new AppError('User account is deactivated', 401);
    }

    return user;
  }
}
