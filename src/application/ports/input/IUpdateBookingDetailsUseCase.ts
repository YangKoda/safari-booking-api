import { UpdateBookingDetailsDTO } from '@application/dtos/inquiry/UpdateBookingDetailsDTO';
import { InquiryResponseDTO } from '@application/dtos/inquiry/InquiryResponseDTO';

export interface IUpdateBookingDetailsUseCase {
  execute(inquiryId: string, dto: UpdateBookingDetailsDTO): Promise<InquiryResponseDTO>;
}
