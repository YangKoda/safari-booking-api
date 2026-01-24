export interface DashboardStatsDTO {
  totalBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  thisMonthBookings: number;
  lastMonthBookings: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
}

export interface BookingAnalyticsDTO {
  totalInquiries: number;
  confirmedInquiries: number;
  pendingInquiries: number;
  cancelledInquiries: number;
  averageBookingValue: number;
  revenueByMonth: MonthlyRevenueDTO[];
}

export interface MonthlyRevenueDTO {
  month: string;
  year: number;
  revenue: number;
  bookings: number;
}

export interface PopularToursDTO {
  mostBooked: TourStatsDTO[];
  mostViewed: TourStatsDTO[];
  mostReviewed: TourStatsDTO[];
  highestRated: TourStatsDTO[];
}

export interface TourStatsDTO {
  id: string;
  name: string;
  slug: string;
  count: number;
  rating?: number;
  imageCover?: string;
}

export interface CustomerInsightsDTO {
  totalActiveUsers: number;
  newUsersThisMonth: number;
  topReviewers: TopReviewerDTO[];
  averageSatisfactionScore: number;
}

export interface TopReviewerDTO {
  userId: string;
  name: string;
  reviewCount: number;
  averageRating: number;
}

export interface GeographicAnalyticsDTO {
  popularDestinations: DestinationStatsDTO[];
}

export interface DestinationStatsDTO {
  location: string;
  bookingCount: number;
  percentage: number;
}
