import { ITourRepository } from '@domain/repositories/ITourRepository';
import { IInquiryRepository } from '@domain/repositories/IInquiryRepository';
import { AppError } from '@shared/errors';

export class DeleteTourUseCase {
  constructor(
    private readonly tourRepository: ITourRepository,
    private readonly inquiryRepository: IInquiryRepository
  ) {}

  async execute(tourId: string): Promise<void> {
    // Check if tour exists
    const tour = await this.tourRepository.findById(tourId);
    if (!tour) {
      throw new AppError('Tour not found', 404);
    }

    const inquiries = await this.inquiryRepository.findByTourId(tourId);


    // Check if there are any confirmed or pending bookings
    const activeBookings = inquiries.filter((i: any) => {
      const status = i.getStatus ? i.getStatus() : i.status;
      return status === 'pending' || status === 'confirmed';
    });

    if (activeBookings.length > 0) {
      throw new AppError(
        'Cannot delete tour with active bookings. Please cancel or complete all bookings first.',
        400
      );
    }

    // Delete the tour (this will cascade delete completed/cancelled inquiries and reviews)
    await this.tourRepository.delete(tourId);
  }
}
