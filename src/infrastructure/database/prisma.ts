import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client (Prisma 7 compatible)
class PrismaService {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      // Prisma 7: No constructor options needed
      // Configuration is in prisma.config.ts
      PrismaService.instance = new PrismaClient();

      // Graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaService.instance?.$disconnect();
      });
    }

    return PrismaService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      PrismaService.instance = null;
    }
  }
}

export const prisma = PrismaService.getInstance();
export default prisma;
