import { Inquiry } from '@domain/entities/Inquiry';
import { Money } from '@domain/value-objects/Money';
import { DateRange } from '@domain/value-objects/DateRange';
import { IInquiryRepository } from '@domain/repositories/IInquiryRepository';
import { ITourRepository } from '@domain/repositories/ITourRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { CreateInquiryDTO, CreateInquiryDTOValidator } from "@application/dtos/inquiry/CreateInquiryDTO";
import { InquiryResponseDTO, InquiryResponseDTOMapper } from "@application/dtos/inquiry/InquiryResponseDTO";
import { ValidationError, NotFoundError } from "@shared/errors";


export class CreateInquiryUseCase {
  constructor(
    private readonly inquiryRepository: IInquiryRepository,
    private readonly tourRepository: ITourRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: CreateInquiryDTO): Promise<InquiryResponseDTO> {
    // 1. Validate DTO
CreateInquiryDTOValidator.validate(dto);


    // 2. Verify tour exists
    const tour = await this.tourRepository.findById(dto.tourId);
    if (!tour) {
      throw new NotFoundError(`Tour with ID ${dto.tourId} not found`);
    }

    // 3. Verify user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${dto.userId} not found`);
    }

    // 4. Verify tour has capacity for the requested number of participants
    if (dto.participants > tour.getMaxCapacity()) {
      throw new ValidationError('Booking exceeds tour capacity', {
        participants: [
          `Tour capacity is ${tour.getMaxCapacity()}, but ${dto.participants} participants requested`,
        ],
      });
    }

    // 5. Create DateRange value object
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const dateRange = new DateRange(startDate, endDate);

    // 6. Create Inquiry entity
  const inquiry = new Inquiry({
  tourId: dto.tourId,
  userId: dto.userId,

  customerName: user.getName(),
  customerEmail: String(user.getEmail()),
  customerPhone: user.getPhone() ?? 'N/A',

  participants: dto.participants,
  preferredDateRange: dateRange,

  totalPrice: tour.getPrice().multiply(dto.participants),

  specialRequests: dto.specialRequests,
  status: 'pending', // All new inquiries start as pending
});

    // 7. Save to repository
    const savedInquiry = await this.inquiryRepository.save(inquiry);

    // 8. Convert to response DTO and return
    return InquiryResponseDTOMapper.toDTOWithDetails(savedInquiry, tour.getName(), user.getName());


  }
}
