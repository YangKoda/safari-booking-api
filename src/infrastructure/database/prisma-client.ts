import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import Logger from '@shared/utils/logger';

/**
 * Centralized Prisma Client Configuration
 *
 * Following Clean Architecture principles:
 * - Single Responsibility: Database connection management
 * - Dependency Inversion: Infrastructure detail hidden behind abstraction
 * - Singleton Pattern: Single database connection pool across application
 *
 * Prisma 7 requires explicit database adapter configuration
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  Logger.error('DATABASE_URL environment variable is not defined');
  throw new Error('DATABASE_URL must be defined in environment variables');
}

// PostgreSQL connection pool with optimized settings for safari booking system
const pool = new Pool({
  connectionString,
  max: 20, // Maximum pool connections for handling concurrent safari bookings
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast if connection unavailable
});

// Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// Prisma Client with adapter and logging configuration
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Graceful shutdown handler for database connections
export const disconnectDatabase = async (): Promise<void> => {
  Logger.info('Closing database connections...');
  await prisma.$disconnect();
  await pool.end();
  Logger.success('Database connections closed successfully');
};

// Connection health check for safari booking API
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    Logger.success('Database connection verified');
    return true;
  } catch (error) {
    Logger.error('Database connection failed:', error);
    return false;
  }
};
