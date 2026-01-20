import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '[{level}] {msg}',
    },
  },
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

class Logger {
  static info(message: string): void {
    logger.info(message);
  }

  static error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      logger.error(`${message}: ${error.message}`);
    } else {
      logger.error(message);
    }
  }

  static warn(message: string): void {
    logger.warn(message);
  }

  static debug(message: string): void {
    logger.debug(message);
  }

  static success(message: string): void {
    logger.info(`[OK] ${message}`);
  }
}

export default Logger;
