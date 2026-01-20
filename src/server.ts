import app from './app';
import { config } from '@infrastructure/config/env';
import { checkDatabaseConnection, disconnectDatabase } from '@infrastructure/database/prisma-client';
import Logger from '@shared/utils/logger';

const printBanner = (): void => {
  console.log(`
╔═════════════════════════╗
║  Safari Booking API     ║
╚═════════════════════════╝
  `);
};

const startServer = async (): Promise<void> => {
  const startTime = Date.now();

  try {
    printBanner();

    Logger.info('Initializing Safari Booking API...');
    Logger.info(`Environment: ${config.nodeEnv}`);
    Logger.info(`Port: ${config.port}`);

    // Database connection
    Logger.info('Checking database connection...');
    const isConnected = await checkDatabaseConnection();

    if (!isConnected) {
      Logger.error('Failed to connect to database');
      process.exit(1);
    }

    Logger.success('Database connection verified');

    // Start server
    Logger.info('Starting HTTP server...');

    app.listen(config.port, () => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      Logger.success(`Server started successfully in ${duration}s`);
      Logger.info(`  Health: http://localhost:${config.port}/health`);
      Logger.info(`  API v1: http://localhost:${config.port}/api/v1`);
      Logger.info(`  Tours:  http://localhost:${config.port}/api/v1/tours`);
      Logger.info(`  Users:  http://localhost:${config.port}/api/v1/users`);
      Logger.info(`  Inquiries:  http://localhost:${config.port}/api/v1/inquiries`);
      Logger.info(`  Reviews: http://localhost:${config.port}/api/v1/reviews`);
    });
  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  Logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    await disconnectDatabase();
    Logger.success('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    Logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('SIGTERM', () =>  gracefulShutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  Logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown) => {
  Logger.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

startServer();
