import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@infrastructure/config/env';
import { errorHandler } from '@infrastructure/web/middleware/errorHandler';
import Logger from '@shared/utils/logger';

const app: Application = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  Logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Safari Booking API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API routes (Phase 5)
// app.use('/api/v1/tours', tourRoutes);
// app.use('/api/v1/inquiries', inquiryRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

export default app;
