import { PrismaClient } from '@prisma/client';
import { ITourRepository } from '@domain/repositories/ITourRepository';
import { Tour, TourDifficulty } from '@domain/entities/Tour';
import { Money } from '@domain/value-objects/Money';

export class PrismaTourRepository implements ITourRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Tour | null> {
    const tourData = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        startLocation: true,
        locations: true,
        tourGuides: true,
      },
    });

    if (!tourData) return null;

    return this.toDomain(tourData);
  }

  async findAll(): Promise<Tour[]> {
    const tours = await this.prisma.tour.findMany({
      include: {
        startLocation: true,
        locations: true,
        tourGuides: true,
      },
    });
    return tours.map((tour) => this.toDomain(tour));
  }

  async findByDuration(minDays: number, maxDays: number): Promise<Tour[]> {
    const tours = await this.prisma.tour.findMany({
      where: {
        duration: {
          gte: minDays,
          lte: maxDays,
        },
      },
      include: {
        startLocation: true,
        locations: true,
        tourGuides: true,
      },
    });
    return tours.map((tour) => this.toDomain(tour));
  }

  async findByPriceRange(minPrice: Money, maxPrice: Money): Promise<Tour[]> {
    const tours = await this.prisma.tour.findMany({
      where: {
        priceAmount: {
          gte: minPrice.getAmount(),
          lte: maxPrice.getAmount(),
        },
      },
      include: {
        startLocation: true,
        locations: true,
        tourGuides: true,
      },
    });
    return tours.map((tour) => this.toDomain(tour));
  }

  async save(tour: Tour): Promise<Tour> {
    const data = this.toPersistence(tour);
    const id = tour.getId();

    if (!id) {
      throw new Error('Tour ID is required for save operation');
    }

    const savedTour = await this.prisma.tour.upsert({
      where: { id },
      update: data.tour as any,
      create: {
        id,
        ...data.tour
      } as any ,
      include: {
        locations: true,
        tourGuides: true,
      },
    });

    // Handle relations separately for upsert
    if (data.startLocation) {
      await this.prisma.tourLocation.upsert({
        where: { startTourId: id },
        update: {
          ...data.startLocation,
          tourId: id,
        },
        create: {
          ...data.startLocation,
          startTourId: id,
        tourId: id,
      },
      });
    }

    // Update locations
    await this.prisma.tourLocation.deleteMany({
      where: { tourId: id },
    });

    if (data.locations.length > 0) {
      await this.prisma.tourLocation.createMany({
        data: data.locations.map((loc) => ({ ...loc, tourId: id })),
      });
    }

    // Update guides
    await this.prisma.tourGuide.deleteMany({
      where: { tourId: id },
    });

    if (data.guides.length > 0) {
      await this.prisma.tourGuide.createMany({
        data: data.guides.map((guideId) => ({
          tourId: id,
          userId: guideId,
        })),
      });
    }

    // Fetch and return updated tour
    const updatedTour = await this.findById(id);
    if (!updatedTour) {
      throw new Error('Failed to retrieve saved tour');
    }

    return updatedTour;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tour.delete({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Tour | null> {
    const tourData = await this.prisma.tour.findUnique({
      where: { name },
      include: {
        locations: true,
        tourGuides: true,
      },
    });

    if (!tourData) return null;

    return this.toDomain(tourData);
  }

  async findByDifficulty(difficulty: 'easy' | 'medium' | 'difficult'): Promise<Tour[]> {
    const tours = await this.prisma.tour.findMany({
      where: {
        difficulty: this.mapDifficultyToPrisma(difficulty) as any,
      },
      include: {
        locations: true,
        tourGuides: true,
      },
    });
    return tours.map((tour) => this.toDomain(tour));
  }

  async findAvailable(): Promise<Tour[]> {
    const now = new Date();
    const tours = await this.prisma.tour.findMany({
      include: {
        locations: true,
        tourGuides: true,
      },
    });

    // Filter in memory for dates in the future
    const availableTours = tours.filter((tour) =>
      tour.startDates.some((date) => date > now)
    );

    return availableTours.map((tour) => this.toDomain(tour));
  }

  async update(tour: Tour): Promise<Tour> {
    // Update is the same as save for our upsert implementation
    return this.save(tour);
  }

  async countTours(): Promise<number> {
    return this.prisma.tour.count();
  }

  async findTopRated(limit: number): Promise<Tour[]> {
    const tours = await this.prisma.tour.findMany({
      where: {
        ratingsQuantity: {
          gt: 0,
        },
      },
      orderBy: {
        ratingsAverage: 'desc',
      },
      take: limit,
      include: {
        locations: true,
        tourGuides: true,
      },
    });
    return tours.map((tour) => this.toDomain(tour));
  }

  // ============================================
  // MAPPERS: Database ↔ Domain
  // ============================================

  private toDomain(raw: any): Tour {
    return new Tour({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      summary: raw.summary,
      duration: raw.duration,
      maxGroupSize: raw.maxGroupSize,
      difficulty: this.mapDifficultyToDomain(raw.difficulty),
      price: new Money(Number(raw.priceAmount), raw.currency),
      imageCover: raw.imageCover,
      images: raw.images,
      startDates: raw.startDates,
      startLocation: raw.startLocation ? {
        description: raw.startLocation.description,
        coordinates: [raw.startLocation.longitude, raw.startLocation.latitude],
        address: raw.startLocation.address || '',
      } : {
        description: 'Default Location',
        coordinates: [0, 0],
        address: '',
      },
      locations: raw.locations?.map((loc: any) => ({
        description: loc.description,
        coordinates: [loc.longitude, loc.latitude],
        day: loc.day || 1,
      })) || [],
      guides: raw.tourGuides?.map((tg: any) => tg.userId) || [],
      ratingsAverage: raw.ratingsAverage,
      ratingsQuantity: raw.ratingsQuantity,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private toPersistence(tour: Tour) {
    const startLocation = tour.getStartLocation();
    const locations = tour.getLocations();


    return {
      tour: {
        name: tour.getName(),
        slug: this.generateSlug(tour.getName()),
        description: tour.getDescription(),
        summary: tour.getSummary(),
        duration: tour.getDuration(),
        maxGroupSize: tour.getMaxGroupSize(),
        difficulty: this.mapDifficultyToPrisma(tour.getDifficulty()) as any,
        priceAmount: tour.getPrice().getAmount(),
        currency: tour.getPrice().getCurrency(),
        imageCover: tour.getImageCover(),
        images: tour.getImages(),
        startDates: tour.getStartDates(),
        ratingsAverage: tour.getRatingsAverage(),
        ratingsQuantity: tour.getRatingsQuantity(),
        updatedAt: new Date(),
      },
      startLocation: startLocation ? {
        description: startLocation.description,
        address: startLocation.address,
        longitude: startLocation.coordinates[0],
        latitude: startLocation.coordinates[1],
      } : null,
      locations: locations.map((loc) => ({
        description: loc.description,
        address: '', // Optional field
        longitude: loc.coordinates[0],
        latitude: loc.coordinates[1],
        day: loc.day,
      })),
      guides: tour.getGuides(),
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private mapDifficultyToDomain(difficulty: string): TourDifficulty {
    const mapping: Record<string, TourDifficulty> = {
      EASY: 'easy',
      MEDIUM: 'medium',
      DIFFICULT: 'difficult',
    };
    return mapping[difficulty] || 'medium';
  }

  private mapDifficultyToPrisma(difficulty: TourDifficulty): string {
    const mapping: Record<TourDifficulty, string> = {
      easy: 'EASY',
      medium: 'MEDIUM',
      difficult: 'DIFFICULT',
    };
    return mapping[difficulty];
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
