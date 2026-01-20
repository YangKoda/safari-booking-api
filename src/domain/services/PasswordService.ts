/**
 * Domain Service Interface for Password Operations
 *
 * Why it's in the domain layer:
 * - Password hashing is a core business rule (security requirement)
 * - Domain entities (User) need to validate passwords
 * - Implementation details (bcrypt) belong in infrastructure
 */
export interface PasswordService {
  /**
   * Hash a plain text password
   * @param password - Plain text password
   * @returns Hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare a plain text password with a hashed password
   * @param plainPassword - Plain text password
   * @param hashedPassword - Hashed password
   * @returns True if passwords match
   */
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
