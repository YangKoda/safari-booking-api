import { IAnalyticsRepository } from '@domain/repositories/IAnalyticsRepository';
import { GeographicAnalyticsDTO } from '@application/dtos/analytics/AnalyticsDTOs';

/**
 * Use Case: Get Geographic Analytics
 *
 * Retrieves geographic distribution of bookings:
 * - Popular destinations (extracted from tour addresses)
 * - Booking count per location
 * - Percentage distribution
 *
 * Useful for understanding which safari destinations are most popular
 *
 * Authorization: Admin only
 */
export class GetGeographicAnalyticsUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<GeographicAnalyticsDTO> {
    return await this.analyticsRepository.getGeographicAnalytics();
  }
}
