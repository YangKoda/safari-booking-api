import { IAnalyticsRepository } from '@domain/repositories/IAnalyticsRepository';
import { PopularToursDTO } from '@application/dtos/analytics/AnalyticsDTOs';

/**
 * Use Case: Get Popular Tours
 *
 * Retrieves popular tours across different metrics:
 * - Most Booked: Top 5 tours by inquiry count
 * - Most Viewed: Top 5 tours by view count
 * - Most Reviewed: Top 5 tours by review count
 * - Highest Rated: Top 5 tours by rating (min 5 reviews)
 *
 * Authorization: Admin only
 */
export class GetPopularToursUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<PopularToursDTO> {
    return await this.analyticsRepository.getPopularTours();
  }
}
