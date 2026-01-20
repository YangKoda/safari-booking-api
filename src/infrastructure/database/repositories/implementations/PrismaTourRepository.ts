import { PrismaClient, Difficulty } from '@prisma/client';
import { Tour } from '@domain/entities/Tour';
import { ITourRepository } from '@domain/repositories/ITourRepository';
import { TourMapper } from '../mappers/TourMapper';

export class PrismaTourRepository implements ITourRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // -------------------
  // Create
  // -------------------
  async save(tour: Tour): Promise<Tour> {
    const { tour: tourData, startLocation, locations } = TourMapper.toPrisma(tour);

    await this.prisma.tour.upsert({
      where: { id: tourData.id },
      create: {
        ...tourData,
        locations: {
          create: [startLocation, ...locations],
        },
      },
      update: {
        ...tourData,
        locations: {
          deleteMany: {},
          create: [startLocation, ...locations],
        },
      },
    });

    const saved = await this.findById(tourData.id);
    if (!saved) throw new Error('Tour was saved but could not be reloaded.');

    return saved;
  }

  // -------------------
  // Read
  // -------------------
  async findById(id: string): Promise<Tour | null> {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: { locations: true },
    });

    if (!tour) return null;
    return TourMapper.toDomain(tour);
  }

  async findByName(name: string): Promise<Tour | null> {
    const tour = await this.prisma.tour.findUnique({
      where: { name },
      include: { locations: true },
    });

    if (!tour) return null;
    return TourMapper.toDomain(tour);
  }

  async findAll(): Promise<Tour[]> {
    const tours = await this.prisma.tour.findMany({
      include: { locations: true },
      orderBy: { createdAt: 'desc' },
    });

    return tours.map((t) => TourMapper.toDomain(t));
  }

  async findByDifficulty(difficulty: 'easy' | 'medium' | 'difficult'): Promise<Tour[]> {
    const prismaDifficulty =
      difficulty === 'easy'
        ? Difficulty.EASY
        : difficulty === 'medium'
        ? Difficulty.MEDIUM
        : Difficulty.DIFFICULT;

    const tours = await this.prisma.tour.findMany({
      where: { difficulty: prismaDifficulty },
      include: { locations: true },
      orderBy: { createdAt: 'desc' },
    });

    return tours.map((t) => TourMapper.toDomain(t));
  }

  async findAvailable(): Promise<Tour[]> {
    // Domain rule: tour.isAvailable() checks future startDates
    const tours = await this.prisma.tour.findMany({
      include: { locations: true },
      orderBy: { createdAt: 'desc' },
    });

    return tours
      .map((t) => TourMapper.toDomain(t))
      .filter((t) => t.isAvailable());
  }

  // -------------------
  // Search
  // -------------------

  async search(dto: {
  query?: string;
  difficulty?: 'easy' | 'medium' | 'difficult';
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  maxGroupSize?: number;
  minRatingsAverage?: number;
  startDateFrom?: Date;
  startDateTo?: Date;
  location?: string;
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'priceAmount' | 'ratingsAverage' | 'duration';
  order: 'asc' | 'desc';
}): Promise<{ tours: Tour[]; total: number }> {
  const skip = (dto.page - 1) * dto.limit;

  const where: any = {};

  // Difficulty
  if (dto.difficulty) {
    where.difficulty =
      dto.difficulty === 'easy'
        ? Difficulty.EASY
        : dto.difficulty === 'medium'
        ? Difficulty.MEDIUM
        : Difficulty.DIFFICULT;
  }

  // Price range
  if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
    where.priceAmount = {};
    if (dto.minPrice !== undefined) where.priceAmount.gte = dto.minPrice;
    if (dto.maxPrice !== undefined) where.priceAmount.lte = dto.maxPrice;
  }

  // Duration range
  if (dto.minDuration !== undefined || dto.maxDuration !== undefined) {
    where.duration = {};
    if (dto.minDuration !== undefined) where.duration.gte = dto.minDuration;
    if (dto.maxDuration !== undefined) where.duration.lte = dto.maxDuration;
  }

  // Group size
  if (dto.maxGroupSize !== undefined) {
    where.maxGroupSize = { gte: dto.maxGroupSize };
  }

  // Ratings
  if (dto.minRatingsAverage !== undefined) {
    where.ratingsAverage = { gte: dto.minRatingsAverage };
  }

  // Start dates filter (array)
  if (dto.startDateFrom || dto.startDateTo) {
    where.startDates = {};
    if (dto.startDateFrom) where.startDates.hasSome = [dto.startDateFrom];
    // NOTE: Prisma can't do lte/gt comparisons inside DateTime[] easily.
    // We'll do "availability filtering" inside domain OR keep it simple for now.
  }

  // Text search (query)
  if (dto.query) {
    where.OR = [
      { name: { contains: dto.query, mode: 'insensitive' } },
      { summary: { contains: dto.query, mode: 'insensitive' } },
      { description: { contains: dto.query, mode: 'insensitive' } },
    ];
  }

  // Location filter (via TourLocation.description)
  if (dto.location) {
    where.locations = {
      some: {
        description: { contains: dto.location, mode: 'insensitive' },
      },
    };
  }

  const total = await this.prisma.tour.count({ where });

  const tours = await this.prisma.tour.findMany({
    where,
    include: { locations: true },
    orderBy: { [dto.sortBy]: dto.order },
    skip,
    take: dto.limit,
  });

  return {
    tours: tours.map((t) => TourMapper.toDomain(t)),
    total,
  };
}



  // -------------------
  // Update
  // -------------------
  async update(tour: Tour): Promise<Tour> {
    return this.save(tour);
  }

  // -------------------
  // Delete
  // -------------------
  async delete(id: string): Promise<void> {
    await this.prisma.tour.delete({ where: { id } });
  }

  // -------------------
  // Aggregations
  // -------------------
  async countTours(): Promise<number> {
    return this.prisma.tour.count();
  }

  async findTopRated(limit: number): Promise<Tour[]> {
    const tours = await this.prisma.tour.findMany({
      include: { locations: true },
      orderBy: { ratingsAverage: 'desc' },
      take: limit,
    });

    return tours.map((t) => TourMapper.toDomain(t));
  }
}
