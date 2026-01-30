import { ITourRepository } from '@domain/repositories/ITourRepository';
import { AppError } from '@shared/errors';
import { UpdateTourDTO, UpdateTourDTOValidator } from '@application/dtos/tour/UpdateTourDTO';
import { Money, Currency } from '@domain/value-objects/Money';
import { Tour } from '@domain/entities/Tour';

export class UpdateTourUseCase {
  constructor(private readonly tourRepository: ITourRepository) {}

  async execute(tourId: string, dto: UpdateTourDTO): Promise<Tour> {
    // Validate DTO
    UpdateTourDTOValidator.validate(dto);

    // Find existing tour
    const existingTour = await this.tourRepository.findById(tourId);
    if (!existingTour) {
      throw new AppError('Tour not found', 404);
    }

    // Update tour properties
    if (dto.name !== undefined) {
      existingTour.updateName(dto.name);
    }

    if (dto.location !== undefined) {
      existingTour.updateLocation(dto.location);
    }

    if (dto.description !== undefined) {
      existingTour.updateDescription(dto.description);
    }

if (dto.priceAmount !== undefined && dto.priceCurrency !== undefined) {
      const newPrice = new Money(dto.priceAmount, dto.priceCurrency as Currency);
      existingTour.updatePrice(newPrice);
    }

    if (dto.duration !== undefined) {
      existingTour.updateDuration(dto.duration);
    }

    if (dto.difficulty !== undefined) {
      const difficultyMap: Record<string, 'easy' | 'medium' | 'difficult'> = {
        easy: 'easy',
        moderate: 'medium',
        challenging: 'difficult',
      };

      existingTour.updateDifficulty(difficultyMap[dto.difficulty]);
    }

    if (dto.maxGroupSize !== undefined) {
      existingTour.updateMaxGroupSize(dto.maxGroupSize);
    }

    if (dto.images !== undefined) {
      existingTour.updateImages(dto.images);
    }

    if (dto.startDates !== undefined) {
      existingTour.updateStartDates(dto.startDates.map((d) => new Date(d)));
    }

    if (dto.featured !== undefined) {
      existingTour.updateFeatured(dto.featured);
    }

    // Save updated tour
    const updatedTour = await this.tourRepository.update(existingTour);

    return updatedTour;
  }
}
