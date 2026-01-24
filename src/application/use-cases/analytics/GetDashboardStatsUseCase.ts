import { IAnalyticsRepository } from '@domain/repositories/IAnalyticsRepository';
import { DashboardStatsDTO } from '@application/dtos/analytics/AnalyticsDTOs';

/**
 * Use Case: Get Dashboard Statistics
 *
 * Retrieves high-level dashboard statistics including:
 * - Total bookings, revenue, and customers
 * - This month vs last month comparisons
 *
 * Authorization: Admin only
 */
export class GetDashboardStatsUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<DashboardStatsDTO> {
    return await this.analyticsRepository.getDashboardStats();
  }
}
