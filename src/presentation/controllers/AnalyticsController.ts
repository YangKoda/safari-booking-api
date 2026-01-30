import { Request, Response, NextFunction } from 'express';
import { GetDashboardStatsUseCase } from '@application/use-cases/analytics/GetDashboardStatsUseCase';
import { GetBookingAnalyticsUseCase } from '@application/use-cases/analytics/GetBookingAnalyticsUseCase';
import { GetPopularToursUseCase } from '@application/use-cases/analytics/GetPopularToursUseCase';
import { GetCustomerInsightsUseCase } from '@application/use-cases/analytics/GetCustomerInsightsUseCase';
import { GetGeographicAnalyticsUseCase } from '@application/use-cases/analytics/GetGeographicAnalyticsUseCase';

/**
 * Analytics Controller
 *
 * Handles all analytics-related HTTP requests
 * All endpoints require ADMIN role
 *
 * Endpoints:
 * - GET /api/v1/analytics/dashboard - Dashboard overview stats
 * - GET /api/v1/analytics/bookings - Booking analytics and trends
 * - GET /api/v1/analytics/tours/popular - Popular tours by different metrics
 * - GET /api/v1/analytics/customers - Customer insights and statistics
 * - GET /api/v1/analytics/geographic - Geographic distribution of bookings
 */
export class AnalyticsController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getBookingAnalyticsUseCase: GetBookingAnalyticsUseCase,
    private readonly getPopularToursUseCase: GetPopularToursUseCase,
    private readonly getCustomerInsightsUseCase: GetCustomerInsightsUseCase,
    private readonly getGeographicAnalyticsUseCase: GetGeographicAnalyticsUseCase
  ) {}

  /**
   * GET /api/v1/analytics/dashboard
   *
   * Retrieve dashboard overview statistics
   *
   * Response:
   * {
   *   totalBookings: number,
   *   totalRevenue: number,
   *   totalCustomers: number,
   *   thisMonthBookings: number,
   *   lastMonthBookings: number,
   *   thisMonthRevenue: number,
   *   lastMonthRevenue: number
   * }
   */
  getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await this.getDashboardStatsUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/analytics/bookings
   *
   * Retrieve detailed booking analytics
   *
   * Response:
   * {
   *   totalInquiries: number,
   *   confirmedInquiries: number,
   *   pendingInquiries: number,
   *   cancelledInquiries: number,
   *   averageBookingValue: number,
   *   revenueByMonth: Array<{month, year, revenue, bookings}>
   * }
   */
  getBookingAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const analytics = await this.getBookingAnalyticsUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/analytics/tours/popular
   *
   * Retrieve popular tours by different metrics
   *
   * Response:
   * {
   *   mostBooked: Array<TourStats>,    // Top 5 by bookings
   *   mostViewed: Array<TourStats>,    // Top 5 by views
   *   mostReviewed: Array<TourStats>,  // Top 5 by reviews
   *   highestRated: Array<TourStats>   // Top 5 by rating
   * }
   */
  getPopularTours = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const popularTours = await this.getPopularToursUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: popularTours,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/analytics/customers
   *
   * Retrieve customer insights and statistics
   *
   * Response:
   * {
   *   totalActiveUsers: number,
   *   newUsersThisMonth: number,
   *   topReviewers: Array<{userId, name, reviewCount, averageRating}>,
   *   averageSatisfactionScore: number
   * }
   */
  getCustomerInsights = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const insights = await this.getCustomerInsightsUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/analytics/geographic
   *
   * Retrieve geographic distribution of bookings
   *
   * Response:
   * {
   *   popularDestinations: Array<{
   *     location: string,
   *     bookingCount: number,
   *     percentage: number
   *   }>
   * }
   */
  getGeographicAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const geographic = await this.getGeographicAnalyticsUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: geographic,
      });
    } catch (error) {
      next(error);
    }
  };
}
