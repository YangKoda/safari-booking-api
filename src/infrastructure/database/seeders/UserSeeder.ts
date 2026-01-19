import { PrismaClient } from '@prisma/client';
import { ALL_USERS, hashPassword } from './data/userData';

export class UserSeeder {
  constructor(private prisma: PrismaClient) {}

  async seed(): Promise<void> {
    console.log(`👥 Seeding ${ALL_USERS.length} users...`);

    for (let i = 0; i < ALL_USERS.length; i++) {
      const userData = ALL_USERS[i];

      try {
        // Hash password
        const hashedPassword = await hashPassword(userData.password);

        // Create user
        const user = await this.prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
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
