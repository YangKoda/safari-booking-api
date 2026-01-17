import app from './app';
import { config } from '@infrastructure/config/env';
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

    // Database connection (Phase 3)
    Logger.info('Checking database connection...');
    Logger.info('Database connection: PENDING (Phase 3)');

    // Start server
    Logger.info('Starting HTTP server...');

    app.listen(config.port, () => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      Logger.success(`Server started successfully in ${duration}s`);

      console.log('\nEndpoints');
      Logger.info(`  Health: http://localhost:${config.port}/health`);
      Logger.info(`  API v1: http://localhost:${config.port}/api/v1 (Phase 5)`);
      console.log('');
    });
  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  Logger.info('Shutdown initiated...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.info('Shutdown initiated...');
  process.exit(0);
});

startServer();
