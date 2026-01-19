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
