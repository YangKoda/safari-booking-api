import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@infrastructure/config/env';
import { errorHandler } from '@infrastructure/web/middleware/errorHandler';
import Logger from '@shared/utils/logger';
import { userRoutes } from 'presentation/routes/userRoutes';
import { tourRoutes } from 'presentation/routes/tourRoutes';
import { reviewRoutes } from 'presentation/routes/reviewRoutes';
import { inquiryRoutes } from 'presentation/routes/inquiryRoutes';
import { authRoutes } from 'presentation/routes/authRoutes';
import { authenticate } from '@presentation/middleware/authenticate';
import { authorize } from '@presentation/middleware/authorize';
import { uploadRoutes } from '@presentation/routes/uploadRoutes';
import analyticsRoutes from '@presentation/routes/analyticsRoutes';



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
// Public routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tours', tourRoutes);

// Protected routes (require authentication)
app.use('/api/v1/users', authenticate, authorize('admin'), userRoutes);
app.use('/api/v1/inquiries', authenticate, inquiryRoutes);
app.use('/api/v1/reviews', authenticate, reviewRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/analytics', authenticate, authorize('admin'), analyticsRoutes);

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
