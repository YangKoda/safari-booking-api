import { PrismaClient, UserRole, InquiryStatus  } from '@prisma/client';
import { IAnalyticsRepository } from '@domain/repositories/IAnalyticsRepository';
import {
  DashboardStatsDTO,
  BookingAnalyticsDTO,
  PopularToursDTO,
  CustomerInsightsDTO,
  GeographicAnalyticsDTO,
} from '@application/dtos/analytics/AnalyticsDTOs';

export class PrismaAnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getDashboardStats(): Promise<DashboardStatsDTO> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalInquiries,
      totalCustomers,
      thisMonthInquiries,
      lastMonthInquiries,
    ] = await Promise.all([
      this.prisma.inquiry.count(),
      this.prisma.user.count({ where: { role: UserRole.USER } }),
      this.prisma.inquiry.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),
      this.prisma.inquiry.count({
        where: {
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
    ]);

    // Calculate revenue from confirmed inquiries
    const thisMonthRevenue = await this.prisma.inquiry.aggregate({
      where: {
        status: InquiryStatus.CONFIRMED,
        createdAt: { gte: thisMonthStart },
      },
      _sum: { totalPrice: true },
    });

    const lastMonthRevenue = await this.prisma.inquiry.aggregate({
      where: {
        status: InquiryStatus.CONFIRMED,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { totalPrice: true },
    });

    const totalRevenue = await this.prisma.inquiry.aggregate({
      where: { status: InquiryStatus.CONFIRMED },
      _sum: { totalPrice: true },
    });

    return {
      totalBookings: totalInquiries,
      totalRevenue: Number(totalRevenue._sum?.totalPrice ?? 0),
      totalCustomers,
      thisMonthBookings: thisMonthInquiries,
      lastMonthBookings: lastMonthInquiries,
      thisMonthRevenue: Number(thisMonthRevenue._sum?.totalPrice ?? 0),
      lastMonthRevenue: Number(lastMonthRevenue._sum?.totalPrice ?? 0),
    };
  }

  // Placeholder methods (will implement next)
  async getBookingAnalytics(): Promise<BookingAnalyticsDTO> {
    throw new Error('Not implemented yet');
  }

  async getPopularTours(): Promise<PopularToursDTO> {
    throw new Error('Not implemented yet');
  }

  async getCustomerInsights(): Promise<CustomerInsightsDTO> {
    throw new Error('Not implemented yet');
  }

  async getGeographicAnalytics(): Promise<GeographicAnalyticsDTO> {
    throw new Error('Not implemented yet');
  }
}
