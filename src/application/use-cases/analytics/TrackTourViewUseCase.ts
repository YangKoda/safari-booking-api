import { ITourRepository } from '@domain/repositories/ITourRepository';
import { AppError } from '@shared/errors';

export interface TrackTourViewDTO {
  tourId: string;
}

export class TrackTourViewUseCase {
  constructor(private readonly tourRepository: ITourRepository) {}

  async execute(dto: TrackTourViewDTO): Promise<void> {
    const tour = await this.tourRepository.findById(dto.tourId);

    if (!tour) {
      throw new AppError('Tour not found', 404);
    }

    tour.incrementViewCount();

    await this.tourRepository.update(tour);
  }
}
