import {
  DashboardStatsDTO,
  BookingAnalyticsDTO,
  PopularToursDTO,
  CustomerInsightsDTO,
  GeographicAnalyticsDTO,
} from '@application/dtos/analytics/AnalyticsDTOs';

export interface IAnalyticsRepository {
  getDashboardStats(): Promise<DashboardStatsDTO>;
  getBookingAnalytics(): Promise<BookingAnalyticsDTO>;
  getPopularTours(): Promise<PopularToursDTO>;
  getCustomerInsights(): Promise<CustomerInsightsDTO>;
  getGeographicAnalytics(): Promise<GeographicAnalyticsDTO>;
}
