import { IAnalyticsRepository } from '@domain/repositories/IAnalyticsRepository';
import { BookingAnalyticsDTO } from '@application/dtos/analytics/AnalyticsDTOs';

/**
 * Use Case: Get Booking Analytics
 *
 * Retrieves detailed booking analytics including:
 * - Inquiry status breakdown (confirmed/pending/cancelled)
 * - Average booking value
 * - Revenue by month (last 12 months)
 *
 * Authorization: Admin only
 */
export class GetBookingAnalyticsUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute(): Promise<BookingAnalyticsDTO> {
    return await this.analyticsRepository.getBookingAnalytics();
  }
}
