import dotenv from 'dotenv';
import Logger from '@shared/utils/logger';
import type { SignOptions } from 'jsonwebtoken';


dotenv.config();

interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
  database: {
    url: string;
  };

  email: {
    enabled: boolean;
  };

  smtp?: {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
};
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: SignOptions['expiresIn'];
    refreshExpiresIn: SignOptions['expiresIn'];
  };
}

const mustExist = (vars: string[]) => {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    Logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

const emailEnabled = String(process.env.EMAIL_ENABLED || 'false').toLowerCase() === 'true';

// Always required
mustExist(['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']);

// Only required if email is enabled
if (emailEnabled) {
  mustExist(['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']);
}

export const config: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  },

  email: {
    enabled: emailEnabled,
  },

  smtp: emailEnabled
    ? {
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
        fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!,
        fromName: process.env.SMTP_FROM_NAME || 'Safari Booking',
      }
    : undefined,
} as const;
