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
      _count: { _all: true },
    });

    // Group by month
    const revenueByMonth = this.groupByMonth(monthlyData);

    return {
      totalInquiries,
      confirmedInquiries,
      pendingInquiries,
      cancelledInquiries,
      averageBookingValue: Number(avgBookingValue._avg?.totalPrice ?? 0),
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
        bookings: existing.bookings + (item._count?._all ?? 0),
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
  const mostBooked = await this.prisma.tour.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      imageCover: true,
      ratingsAverage: true,
      _count: { select: { inquiries: true } },
    },
    orderBy: { inquiries: { _count: 'desc' } },
  });

  const mostViewed = await this.prisma.tour.findMany({
    take: 5,
    where: { viewCount: { gt: 0 } },
    select: {
      id: true,
      name: true,
      slug: true,
      imageCover: true,
      viewCount: true,
      ratingsAverage: true,
    },
    orderBy: { viewCount: 'desc' },
  });

  const mostReviewed = await this.prisma.tour.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      imageCover: true,
      ratingsAverage: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { reviews: { _count: 'desc' } },
  });

  const highestRated = await this.prisma.tour.findMany({
    take: 5,
    where: { ratingsQuantity: { gte: 5 } },
    select: {
      id: true,
      name: true,
      slug: true,
      imageCover: true,
      ratingsAverage: true,
      ratingsQuantity: true,
    },
    orderBy: { ratingsAverage: 'desc' },
  });

  return {
    mostBooked: mostBooked.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t._count.inquiries,
      rating: t.ratingsAverage,
      imageCover: t.imageCover,
    })),
    mostViewed: mostViewed.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t.viewCount,
      rating: t.ratingsAverage,
      imageCover: t.imageCover,
    })),
    mostReviewed: mostReviewed.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t._count.reviews,
      rating: t.ratingsAverage,
      imageCover: t.imageCover,
    })),
    highestRated: highestRated.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      count: t.ratingsQuantity,
      rating: t.ratingsAverage,
      imageCover: t.imageCover,
    })),
  };
}

async getCustomerInsights(): Promise<CustomerInsightsDTO> {
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [totalActiveUsers, newUsersThisMonth, avgRating] = await Promise.all([
    this.prisma.user.count({ where: { active: true, role: UserRole.USER } }),
    this.prisma.user.count({
      where: {
        role: UserRole.USER,
        createdAt: { gte: thisMonthStart },
      },
    }),
    this.prisma.review.aggregate({
      _avg: { rating: true },
    }),
  ]);

  // Top reviewers (users with most reviews)
  const topReviewersData = await this.prisma.user.findMany({
    take: 10,
    where: { role: UserRole.USER },
    select: {
      id: true,
      name: true,
      _count: { select: { reviews: true } },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { reviews: { _count: 'desc' } },
  });

  const topReviewers = topReviewersData
    .filter((u) => u._count.reviews > 0)
    .map((u) => {
      const avgRating =
        u.reviews.reduce((sum, r) => sum + r.rating, 0) / u.reviews.length;
      return {
        userId: u.id,
        name: u.name,
        reviewCount: u._count.reviews,
        averageRating: Number(avgRating.toFixed(1)),
      };
    });

  return {
    totalActiveUsers,
    newUsersThisMonth,
    topReviewers,
    averageSatisfactionScore: Number(avgRating._avg.rating?.toFixed(1) ?? 0),
  };
}

async getGeographicAnalytics(): Promise<GeographicAnalyticsDTO> {
  const tourBookings = await this.prisma.inquiry.groupBy({
    by: ['tourId'],
    _count: { _all: true },
  });

  const tours = await this.prisma.tour.findMany({
    select: {
      id: true,
      name: true,
      startLocation: {
        select: { address: true },
      },
    },
  });

  const locationBookings = new Map<string, number>();

  tourBookings.forEach((booking) => {
    const tour = tours.find((t) => t.id === booking.tourId);
    if (tour?.startLocation?.address) {
      const addressParts = tour.startLocation.address.split(',');
      const location = addressParts[addressParts.length - 1].trim() || tour.name;

      const current = locationBookings.get(location) || 0;
      locationBookings.set(location, current + (booking._count?._all ?? 0));
    }
  });

  const totalBookings = Array.from(locationBookings.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  const popularDestinations = Array.from(locationBookings.entries())
    .map(([location, bookingCount]) => ({
      location,
      bookingCount,
      percentage: totalBookings > 0
        ? Number(((bookingCount / totalBookings) * 100).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount);

  return { popularDestinations };
}
}
