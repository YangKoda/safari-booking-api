import { InquiryStatus } from '@domain/entities/Inquiry';

export interface InquiryResponseDTO {
  id: string;
  tourId: string;
  tourName?: string; // Optional: populated if tour info is needed
  userId: string;
  userName?: string; // Optional: populated if user info is needed
  participants: number;
  dateRange: {
    startDate: string; // ISO 8601 format
    endDate: string;
    durationDays: number;
  };
  specialRequests?: string;
  status: InquiryStatus;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export class InquiryResponseDTOMapper {
  /**
   * Maps an Inquiry entity to a response DTO
   */
  static toDTO(inquiry: {
    getId(): string | undefined;
    getTourId(): string;
    getUserId(): string;
    getParticipants(): number;
    getPreferredDateRange(): {
      getStartDate(): Date;
      getEndDate(): Date;
      getDurationInDays(): number;
    };
    getSpecialRequests(): string | undefined;
    getStatus(): InquiryStatus;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
  }): InquiryResponseDTO {
    const dateRange = inquiry.getPreferredDateRange();

    return {
      id: inquiry.getId() || '',
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

  /**
   * Maps an Inquiry entity with additional tour/user info to a response DTO
   */
  static toDTOWithDetails(
    inquiry: {
      getId(): string | undefined;
      getTourId(): string;
      getUserId(): string;
      getParticipants(): number;
      getPreferredDateRange(): {
        getStartDate(): Date;
        getEndDate(): Date;
        getDurationInDays(): number;
      };
      getSpecialRequests(): string | undefined;
      getStatus(): InquiryStatus;
      getCreatedAt(): Date;
      getUpdatedAt(): Date;
    },
    tourName?: string,
    userName?: string
  ): InquiryResponseDTO {
    const dto = this.toDTO(inquiry);

    if (tourName) {
      dto.tourName = tourName;
    }

    if (userName) {
      dto.userName = userName;
    }

    return dto;
  }

  /**
   * Maps multiple Inquiry entities to response DTOs
   */
  static toDTOList(inquiries: Array<{
    getId(): string | undefined;
    getTourId(): string;
    getUserId(): string;
    getParticipants(): number;
    getPreferredDateRange(): {
      getStartDate(): Date;
      getEndDate(): Date;
      getDurationInDays(): number;
    };
    getSpecialRequests(): string | undefined;
    getStatus(): InquiryStatus;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
  }>): InquiryResponseDTO[] {
    return inquiries.map(inquiry => this.toDTO(inquiry));
  }
}
