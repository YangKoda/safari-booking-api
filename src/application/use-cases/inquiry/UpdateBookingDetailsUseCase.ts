import { DateRange } from '@domain/value-objects/DateRange';
import { IInquiryRepository } from '@domain/repositories/IInquiryRepository';
import { UpdateBookingDetailsDTO, UpdateBookingDetailsDTOValidator } from "@application/dtos/inquiry/UpdateBookingDetailsDTO";
import { InquiryResponseDTO, InquiryResponseDTOMapper } from "@application/dtos/inquiry/InquiryResponseDTO";
import { ValidationError, NotFoundError } from "@shared/errors";


export class UpdateBookingDetailsUseCase {
  constructor(private readonly inquiryRepository: IInquiryRepository) {}

  async execute(inquiryId: string, dto: UpdateBookingDetailsDTO): Promise<InquiryResponseDTO> {
    // 1. Validate DTO
UpdateBookingDetailsDTOValidator.validate(dto);


    // 2. Find inquiry
    const inquiry = await this.inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError(`Inquiry with ID ${inquiryId} not found`);
    }

    // 3. Check if inquiry can be modified
    if (!inquiry.canBeModified()) {
      throw new ValidationError('Inquiry cannot be modified', {
        status: ['Only pending or confirmed inquiries can be modified'],
      });
    }

    // 4. Prepare update data
    const updateData: {
      participants?: number;
      preferredDateRange?: DateRange;
      specialRequests?: string;
      rescheduleReason?: string;
    } = {};

    // Add participants if provided
    if (dto.participants !== undefined) {
      updateData.participants = dto.participants;
    }

    // Add date range if provided
    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);
      updateData.preferredDateRange = new DateRange(startDate, endDate);
    }

    // Add special requests if provided
    if (dto.specialRequests !== undefined) {
      updateData.specialRequests = dto.specialRequests;
    }

    // Add reschedule reason if provided
    if (dto.rescheduleReason !== undefined) {
      updateData.rescheduleReason = dto.rescheduleReason;
    }

    // 5. Update inquiry using entity method
    inquiry.updateBookingDetails(updateData);

    // 6. Save updated inquiry
    const updatedInquiry = await this.inquiryRepository.save(inquiry);

    // 7. Convert to response DTO and return
    return InquiryResponseDTOMapper.toDTO(updatedInquiry);
  }
}
