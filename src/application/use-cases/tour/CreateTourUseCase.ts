import { Tour } from '@domain/entities/Tour';
import { Money } from '@domain/value-objects/Money';
import { ITourRepository } from '@domain/repositories/ITourRepository';
import { CreateTourDTO, CreateTourDTOValidator } from '@application/dtos/tour/CreateTourDTO';
import { TourResponseDTO } from '@application/dtos/tour/TourResponseDTO';
import { ValidationError } from '@shared/errors';

export class CreateTourUseCase {
  constructor(private readonly tourRepository: ITourRepository) {}

  async execute(dto: CreateTourDTO): Promise<TourResponseDTO> {
    // Validate DTO
    const validation = CreateTourDTOValidator.validate(dto);
    if (!validation.isValid) {
      throw new ValidationError('Invalid tour data', validation.errors);
    }

    // Create domain entity
    const price = new Money(dto.priceAmount, dto.priceCurrency as 'USD' | 'EUR' | 'GBP' | 'KES');
    const startDates = dto.startDates.map(date => new Date(date));

    const tour = new Tour({
      name: dto.name,
      slug: this.generateSlug(dto.name),
      description: dto.description,
      duration: dto.duration,
      maxGroupSize: dto.maxGroupSize,
      difficulty: dto.difficulty,
      price,
      summary: dto.summary,
      imageCover: dto.imageCover,
      images: dto.images,
      startDates,
      startLocation: dto.startLocation,
      locations: dto.locations,
      guides: dto.guides,
    });

    // Save to repository
    const savedTour = await this.tourRepository.save(tour);

    // Map to response DTO
    return this.mapToResponseDTO(savedTour);
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

private generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

}
