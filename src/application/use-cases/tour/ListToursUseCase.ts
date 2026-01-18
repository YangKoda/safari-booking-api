import { ITourRepository } from '@domain/repositories/ITourRepository';
import { TourResponseDTO } from '@application/dtos/tour/TourResponseDTO';
import { Tour } from '@domain/entities/Tour';

export class ListToursUseCase {
  constructor(private readonly tourRepository: ITourRepository) {}

  async execute(): Promise<TourResponseDTO[]> {
    const tours = await this.tourRepository.findAll();
    return tours.map(tour => this.mapToResponseDTO(tour));
  }

  private mapToResponseDTO(tour: Tour): TourResponseDTO {
    return {
      id: tour.getId()!,
      name: tour.getName(),
      description: tour.getDescription(),
      duration: tour.getDuration(),
      maxGroupSize: tour.getMaxGroupSize(),
      difficulty: tour.getDifficulty(),
      price: {
        amount: tour.getPrice().getAmount(),
        currency: tour.getPrice().getCurrency(),
      },
      summary: tour.getSummary(),
      imageCover: tour.getImageCover(),
      images: tour.getImages(),
      startDates: tour.getStartDates().map(date => date.toISOString()),
      startLocation: tour.getStartLocation(),
      locations: tour.getLocations(),
      guides: tour.getGuides(),
      ratingsAverage: tour.getRatingsAverage(),
      ratingsQuantity: tour.getRatingsQuantity(),
      createdAt: tour.getCreatedAt().toISOString(),
      updatedAt: tour.getUpdatedAt().toISOString(),
    };
  }
}
