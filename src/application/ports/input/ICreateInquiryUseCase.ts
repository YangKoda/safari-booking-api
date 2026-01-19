import { CreateInquiryDTO } from '@application/dtos/inquiry/CreateInquiryDTO';
import { InquiryResponseDTO } from '@application/dtos/inquiry/InquiryResponseDTO';

export interface ICreateInquiryUseCase {
  execute(dto: CreateInquiryDTO): Promise<InquiryResponseDTO>;
}
