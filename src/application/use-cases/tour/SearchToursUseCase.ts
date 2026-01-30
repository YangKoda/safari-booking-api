import { ITourRepository } from '@domain/repositories/ITourRepository';
import { SearchToursDTO } from '@application/dtos/tour/SearchToursDTO';
import { Tour } from '@domain/entities/Tour';

export class SearchToursUseCase {
  constructor(private readonly tourRepository: ITourRepository) {}

  async execute(dto: SearchToursDTO): Promise<{
    results: number;
    data: Tour[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;

    const sortBy = dto.sortBy ?? 'createdAt';
    const order = dto.order ?? 'desc';

    const startDateFrom = dto.startDateFrom ? new Date(dto.startDateFrom) : undefined;
    const startDateTo = dto.startDateTo ? new Date(dto.startDateTo) : undefined;

    const { tours, total } = await this.tourRepository.search({
      query: dto.query,
      difficulty: dto.difficulty,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      minDuration: dto.minDuration,
      maxDuration: dto.maxDuration,
      maxGroupSize: dto.maxGroupSize,
      minRatingsAverage: dto.minRatingsAverage,
      startDateFrom,
      startDateTo,
      location: dto.location,
      page,
      limit,
      sortBy,
      order,
    });

    const pages = Math.ceil(total / limit);

    return {
      results: tours.length,
      data: tours,
      meta: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }
}
