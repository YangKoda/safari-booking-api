import bcrypt from 'bcrypt';
import { PasswordService } from '@domain/services/PasswordService';

/**
 * Bcrypt implementation of PasswordService
 *
 * Uses bcrypt with 12 rounds (good balance of security and performance)
 */
export class BcryptPasswordService implements PasswordService {
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
