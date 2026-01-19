import { IInquiryRepository } from '@domain/repositories/IInquiryRepository';
import { InquiryResponseDTO } from '@application/dtos/inquiry/InquiryResponseDTO';
import { NotFoundError } from '@shared/errors';
import { Inquiry } from '@domain/entities/Inquiry';

export class GetInquiryUseCase {
  constructor(private readonly inquiryRepository: IInquiryRepository) {}

  async execute(inquiryId: string): Promise<InquiryResponseDTO> {
    const inquiry = await this.inquiryRepository.findById(inquiryId);

    if (!inquiry) {
      throw new NotFoundError(`Inquiry with ID ${inquiryId} not found`);
    }

    return this.mapToResponseDTO(inquiry);
  }

private mapToResponseDTO(inquiry: Inquiry): InquiryResponseDTO {
    const dateRange = inquiry.getPreferredDateRange();

    return {
      id: inquiry.getId()!,
      tourId: inquiry.getTourId(),
      userId: inquiry.getUserId(),
      participants: inquiry.getParticipants(),
      dateRange: {
        startDate: dateRange.getStartDate().toISOString().split('T')[0],
        endDate: dateRange.getEndDate().toISOString().split('T')[0],
        durationDays: dateRange.getDurationInDays(),
      },
      specialRequests: inquiry.getSpecialRequests(),
      status: inquiry.getStatus(),
      createdAt: inquiry.getCreatedAt().toISOString(),
      updatedAt: inquiry.getUpdatedAt().toISOString(),
    };
  }
}
