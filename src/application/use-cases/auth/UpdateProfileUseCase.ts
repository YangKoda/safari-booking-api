import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Email } from '@domain/value-objects/Email';
import { AppError, ValidationError } from '@shared/errors';

export interface UpdateProfileDTO {
  userId: string;
  name?: string;
  username?: string;
  phone?: string;
  photo?: string;
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: UpdateProfileDTO): Promise<void> {
    // 1) Find user
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // 2) Check username uniqueness if changing
    if (dto.username && dto.username !== user.getUsername()) {
      const existingUser = await this.userRepository.findByUsername(dto.username);
      if (existingUser) {
        throw new ValidationError('Profile update failed', {
          username: ['Username already taken'],
        });
      }
      user.updateUsername(dto.username);
    }

    // 3) Update other fields
    if (dto.name) {
      user.updateName(dto.name);
    }
    if (dto.phone !== undefined) {
      // Allow clearing phone by passing empty string
      // Update phone logic (add to User entity if not present)
    }
    if (dto.photo) {
      user.updatePhoto(dto.photo);
    }

    // 4) Save to database
    await this.userRepository.update(user);
  }
}
