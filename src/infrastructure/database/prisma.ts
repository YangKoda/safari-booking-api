import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Singleton pattern for Prisma Client (Prisma 7 with adapter)
class PrismaService {
  private static instance: PrismaClient | null = null;
  private static pool: Pool | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      // Ensure DATABASE_URL is loaded
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      // Create PostgreSQL connection pool
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      // Create Prisma adapter
      const adapter = new PrismaPg(this.pool);

      // Create Prisma Client with adapter
      PrismaService.instance = new PrismaClient({ adapter });

      // Graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaService.instance?.$disconnect();
        await this.pool?.end();
      });
    }

    return PrismaService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      PrismaService.instance = null;
    }
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const prisma = PrismaService.getInstance();
export default prisma;
