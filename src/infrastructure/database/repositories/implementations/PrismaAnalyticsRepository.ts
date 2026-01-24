import { PrismaClient, UserRole, InquiryStatus  } from '@prisma/client';
import { IAnalyticsRepository } from '@domain/repositories/IAnalyticsRepository';
import {
  DashboardStatsDTO,
  BookingAnalyticsDTO,
  PopularToursDTO,
  CustomerInsightsDTO,
  GeographicAnalyticsDTO,
  MonthlyRevenueDTO,
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
    const [
      totalInquiries,
      confirmedInquiries,
      pendingInquiries,
      cancelledInquiries,
      avgBookingValue,
    ] = await Promise.all([
      this.prisma.inquiry.count(),
      this.prisma.inquiry.count({ where: { status: InquiryStatus.CONFIRMED } }),
      this.prisma.inquiry.count({ where: { status: InquiryStatus.PENDING } }),
      this.prisma.inquiry.count({ where: { status: InquiryStatus.CANCELLED } }),
      this.prisma.inquiry.aggregate({
        where: { status: InquiryStatus.CONFIRMED },
        _avg: { totalPrice: true },
      }),
    ]);

    // Get revenue by month for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = await this.prisma.inquiry.groupBy({
      by: ['createdAt'],
      where: {
        status: InquiryStatus.CONFIRMED,
        createdAt: { gte: twelveMonthsAgo },
      },
      _sum: { totalPrice: true },
      _count: true,
    });

    // Group by month
    const revenueByMonth = this.groupByMonth(monthlyData);

    return {
      totalInquiries,
      confirmedInquiries,
      pendingInquiries,
      cancelledInquiries,
      averageBookingValue: Number(avgBookingValue._avg.totalPrice ?? 0),
      revenueByMonth,
    };
  }

  private groupByMonth(data: any[]): MonthlyRevenueDTO[] {
    const monthMap = new Map<string, { revenue: number; bookings: number }>();

    data.forEach((item) => {
      const date = new Date(item.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = monthMap.get(key) || { revenue: 0, bookings: 0 };
      monthMap.set(key, {
        revenue: existing.revenue + Number(item._sum.totalPrice ?? 0),
        bookings: existing.bookings + (item._count ?? 0),
      });
    });

    return Array.from(monthMap.entries())
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return {
          month: new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long' }),
          year: Number(year),
          revenue: value.revenue,
          bookings: value.bookings,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return new Date(`${a.month} 1`).getMonth() - new Date(`${b.month} 1`).getMonth();
      });
  }

async getPopularTours(): Promise<PopularToursDTO> {
  // Most booked (by inquiry count)
  const mostBooked = await this.prisma.tour.findMany({
    take: 5,
    orderBy: { inquiries: { _count: 'desc' } },
    select: {
      id: true,
      name: true,
      slug: true,
      imageCover: true,
      ratingsAverage: true,
      _count: { select: { inquiries: true } },
    },
  });

  // Most viewed (by viewCount)
  const mostViewed = await this.prisma.tour.findMany({
    take: 5,
    orderBy: { viewCount: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      imageCover: true,
      viewCount: true,
      ratingsAverage: true,
    },
  });

  // Most reviewed (by review count)
  const mostReviewed = await this.prisma.tour.findMany({
    take: 5,
    orderBy: { reviews: { _count: 'desc' } },
    select: {
      id: true,
      name: true,
      slug: true,
      imageCover: true,
      ratingsAverage: true,
      _count: { select: { reviews: true } },
    },
  });

  // Highest rated (by ratingsAverage, minimum 5 reviews)
  const highestRated = await this.prisma.tour.findMany({
    take: 5,
    where: { ratingsQuantity: { gte: 5 } },
    orderBy: { ratingsAverage: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      imageCover: true,
      ratingsAverage: true,
      ratingsQuantity: true,
    },
  });

  return {
    mostBooked: mostBooked.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t._count.inquiries,
      rating: Number(t.ratingsAverage),
      imageCover: t.imageCover || undefined,
    })),
    mostViewed: mostViewed.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t.viewCount,
      rating: Number(t.ratingsAverage),
      imageCover: t.imageCover || undefined,
    })),
    mostReviewed: mostReviewed.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t._count.reviews,
      rating: Number(t.ratingsAverage),
      imageCover: t.imageCover || undefined,
    })),
    highestRated: highestRated.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t.ratingsQuantity,
      rating: Number(t.ratingsAverage),
      imageCover: t.imageCover || undefined,
    })),
  };
}

  async getCustomerInsights(): Promise<CustomerInsightsDTO> {
    throw new Error('Not implemented yet');
  }

  async getGeographicAnalytics(): Promise<GeographicAnalyticsDTO> {
    throw new Error('Not implemented yet');
  }
}
