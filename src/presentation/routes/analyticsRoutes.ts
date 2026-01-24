import { Router } from 'express';
import { AnalyticsController } from '@presentation/controllers/AnalyticsController';
import { authenticate } from '@presentation/middleware/authenticate';
import { authorize } from '@presentation/middleware/authorize';
import { PrismaAnalyticsRepository } from '@infrastructure/database/repositories/implementations/PrismaAnalyticsRepository';
import { GetDashboardStatsUseCase } from '@application/use-cases/analytics/GetDashboardStatsUseCase';
import { GetBookingAnalyticsUseCase } from '@application/use-cases/analytics/GetBookingAnalyticsUseCase';
import { GetPopularToursUseCase } from '@application/use-cases/analytics/GetPopularToursUseCase';
import { GetCustomerInsightsUseCase } from '@application/use-cases/analytics/GetCustomerInsightsUseCase';
import { GetGeographicAnalyticsUseCase } from '@application/use-cases/analytics/GetGeographicAnalyticsUseCase';
import prisma from '@infrastructure/database/prisma';

const router = Router();

// Initialize repository
const analyticsRepository = new PrismaAnalyticsRepository(prisma);

// Initialize use cases
const getDashboardStatsUseCase = new GetDashboardStatsUseCase(analyticsRepository);
const getBookingAnalyticsUseCase = new GetBookingAnalyticsUseCase(analyticsRepository);
const getPopularToursUseCase = new GetPopularToursUseCase(analyticsRepository);
const getCustomerInsightsUseCase = new GetCustomerInsightsUseCase(analyticsRepository);
const getGeographicAnalyticsUseCase = new GetGeographicAnalyticsUseCase(analyticsRepository);

// Initialize controller
const analyticsController = new AnalyticsController(
  getDashboardStatsUseCase,
  getBookingAnalyticsUseCase,
  getPopularToursUseCase,
  getCustomerInsightsUseCase,
  getGeographicAnalyticsUseCase
);

// All analytics routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get dashboard overview statistics
 * @access  Admin only
 */
router.get('/dashboard', analyticsController.getDashboardStats);

/**
 * @route   GET /api/v1/analytics/bookings
 * @desc    Get detailed booking analytics
 * @access  Admin only
 */
router.get('/bookings', analyticsController.getBookingAnalytics);

/**
 * @route   GET /api/v1/analytics/tours/popular
 * @desc    Get popular tours by different metrics
 * @access  Admin only
 */
router.get('/tours/popular', analyticsController.getPopularTours);

/**
 * @route   GET /api/v1/analytics/customers
 * @desc    Get customer insights and statistics
 * @access  Admin only
 */
router.get('/customers', analyticsController.getCustomerInsights);

/**
 * @route   GET /api/v1/analytics/geographic
 * @desc    Get geographic distribution of bookings
 * @access  Admin only
 */
router.get('/geographic', analyticsController.getGeographicAnalytics);

export default router;
