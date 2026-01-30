import { PrismaClient, Difficulty, Prisma } from '@prisma/client';
import { Tour } from '@domain/entities/Tour';
import { ITourRepository } from '@domain/repositories/ITourRepository';
import { TourMapper } from '../mappers/TourMapper';

export class PrismaTourRepository implements ITourRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // -------------------
  // Create / Save
  // -------------------
  async save(tour: Tour): Promise<Tour> {
    const tourId = tour.getId();

    //  CREATE path (no id yet)
    if (!tourId) {
      return this.createNewTour(tour);
    }
//  UPDATE path (existing tour)
const { tour: tourData, startLocation, locations } = TourMapper.toPrisma(tour);

const { id, ...tourUpdateData } = tourData;

await this.prisma.tour.update({
  where: { id },
  data: {
    ...tourUpdateData,
    locations: {
      deleteMany: {},
      create: [startLocation, ...locations],
    },
  },
});

const saved = await this.findById(id);
if (!saved) throw new Error('Tour was saved but could not be reloaded.');

return saved;
  }
  //  CREATE helper (Prisma generates id first)
  private async createNewTour(tour: Tour): Promise<Tour> {
    const created = await this.prisma.tour.create({
      data: {
        name: tour.getName(),
        slug: tour.getSlug(),
        description: tour.getDescription(),
        summary: tour.getSummary(),
        duration: tour.getDuration(),
        maxGroupSize: tour.getMaxGroupSize(),
        difficulty: tour.getDifficulty().toUpperCase() as Difficulty,
        priceAmount: new Prisma.Decimal(tour.getPrice().getAmount()),
        currency: tour.getPrice().getCurrency(),
        imageCover: tour.getImageCover(),
        images: tour.getImages(),
        startDates: tour.getStartDates(),
        ratingsAverage: tour.getRatingsAverage(),
        ratingsQuantity: tour.getRatingsQuantity(),
        viewCount: tour.getViewCount(),
      },
    });

    //  Now we have created.id  insert locations
    const startLoc = tour.getStartLocation();
    await this.prisma.tourLocation.create({
      data: {
        description: startLoc.description,
        address: null,
        longitude: startLoc.coordinates[0],
        latitude: startLoc.coordinates[1],
        day: null,
        tourId: created.id,
        startTourId: created.id, //  marks this as startLocation
      },
    });

    const stops = tour.getLocations();
    if (stops.length > 0) {
      await this.prisma.tourLocation.createMany({
        data: stops.map((loc) => ({
          description: loc.description,
          address: null,
          longitude: loc.coordinates[0],
          latitude: loc.coordinates[1],
          day: loc.day,
          tourId: created.id,
          startTourId: null,
        })),
      });
    }

    const saved = await this.findById(created.id);
    if (!saved) throw new Error('Tour was created but could not be reloaded.');

    return saved;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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

    if (dto.difficulty) {
      where.difficulty =
        dto.difficulty === 'easy'
          ? Difficulty.EASY
          : dto.difficulty === 'medium'
          ? Difficulty.MEDIUM
          : Difficulty.DIFFICULT;
    }

    if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
      where.priceAmount = {};
      if (dto.minPrice !== undefined) where.priceAmount.gte = dto.minPrice;
      if (dto.maxPrice !== undefined) where.priceAmount.lte = dto.maxPrice;
    }

    if (dto.minDuration !== undefined || dto.maxDuration !== undefined) {
      where.duration = {};
      if (dto.minDuration !== undefined) where.duration.gte = dto.minDuration;
      if (dto.maxDuration !== undefined) where.duration.lte = dto.maxDuration;
    }

    if (dto.maxGroupSize !== undefined) {
      where.maxGroupSize = { gte: dto.maxGroupSize };
    }

    if (dto.minRatingsAverage !== undefined) {
      where.ratingsAverage = { gte: dto.minRatingsAverage };
    }

    if (dto.query) {
      where.OR = [
        { name: { contains: dto.query, mode: 'insensitive' } },
        { summary: { contains: dto.query, mode: 'insensitive' } },
        { description: { contains: dto.query, mode: 'insensitive' } },
      ];
    }

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
