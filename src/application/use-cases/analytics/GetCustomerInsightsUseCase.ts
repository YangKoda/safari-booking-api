import { IAnalyticsRepository } from '@domain/repositories/IAnalyticsRepository';
import { CustomerInsightsDTO } from '@application/dtos/analytics/AnalyticsDTOs';

/**
 * Use Case: Get Customer Insights
 *
 * Retrieves customer-related analytics including:
 * - Total active users
 * - New users this month
 * - Top 10 reviewers with their statistics
 * - Average satisfaction score (from all reviews)
 *
 * Authorization: Admin only
 */
export class GetCustomerInsightsUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<CustomerInsightsDTO> {
    return await this.analyticsRepository.getCustomerInsights();
  }
}
