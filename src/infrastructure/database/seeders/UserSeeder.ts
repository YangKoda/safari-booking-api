import { PrismaClient, UserRole } from '@prisma/client';
import { ALL_USERS, hashPassword } from './data/userData';

export class UserSeeder {
  constructor(private prisma: PrismaClient) {}

  async seed(): Promise<void> {
    console.log(`👥 Seeding ${ALL_USERS.length} users...`);

    const DEFAULT_PASSWORDS: Record<UserRole, string> = {
      ADMIN: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
      GUIDE: process.env.SEED_GUIDE_PASSWORD ?? 'guide123',
      LEAD_GUIDE: process.env.SEED_GUIDE_PASSWORD ?? 'guide123', // ✅ add this
      USER: process.env.SEED_CUSTOMER_PASSWORD ?? 'customer123',
      };
    for (let i = 0; i < ALL_USERS.length; i++) {
      const userData = ALL_USERS[i];

      try {
        const fallbackPassword = DEFAULT_PASSWORDS[userData.role];
        const plainPassword = userData.password ?? fallbackPassword;

        // Hash password
        const hashedPassword = await hashPassword(plainPassword);

        // Create user
        const user = await this.prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            username: userData.username ?? null,
            role: userData.role,
            password: hashedPassword,
            phone: userData.phone,
            photo: userData.photo,
            active: userData.active,
          },
        });

        console.log(`  ✓ Created user ${i + 1}/${ALL_USERS.length}: ${user.name} (${user.role})`);
      } catch (error) {
        console.error(`  ✗ Failed to create user: ${userData.email}`, error);
        throw error;
      }
    }

    console.log(`✅ Successfully seeded ${ALL_USERS.length} users`);
  }
}
