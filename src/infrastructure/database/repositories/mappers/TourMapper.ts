import { Tour, TourProps } from '@domain/entities/Tour';
import { Money } from '@domain/value-objects/Money';
import { Tour as PrismaTour, TourLocation as PrismaTourLocation, Difficulty, Prisma } from '@prisma/client';


type PrismaTourWithLocations = PrismaTour & {
  locations: PrismaTourLocation[];
};

export class TourMapper {
  /**
   * Convert Prisma Tour model to Domain Tour entity
   */
  static toDomain(prisma: PrismaTourWithLocations): Tour {
    // Find start location
    const startLocation = prisma.locations.find((loc) => loc.startTourId === prisma.id);

    if (!startLocation) {
      throw new Error(`Start location not found for tour ${prisma.id}`);
    }

    // Convert tour locations (excluding start location)
    const tourLocations = prisma.locations
      .filter((loc) => !loc.startTourId)
      .sort((a, b) => (a.day || 0) - (b.day || 0))
      .map((loc) => ({
        description: loc.description,
        coordinates: [loc.longitude, loc.latitude] as [number, number],
        day: loc.day || 0,
      }));

    // Create Tour entity using constructor
    const tourProps: TourProps = {
      id: prisma.id,
      name: prisma.name,
      slug: prisma.slug,
      duration: prisma.duration,
      maxGroupSize: prisma.maxGroupSize,
      difficulty: prisma.difficulty.toLowerCase() as 'easy' | 'medium' | 'difficult',
      price: new Money(Number(prisma.priceAmount), prisma.currency),
      summary: prisma.summary,
      description: prisma.description || '',
      imageCover: prisma.imageCover,
      images: prisma.images,
      startLocation: {
        description: startLocation.description,
        coordinates: [startLocation.longitude, startLocation.latitude] as [number, number],
      },
      locations: tourLocations,
      guides: [], // Empty array - will be populated from tour_guides table
      startDates: prisma.startDates.map((date) => new Date(date)),
      ratingsAverage: prisma.ratingsAverage || 0,
      ratingsQuantity: prisma.ratingsQuantity || 0,
      viewCount: prisma.viewCount || 0,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };

    return new Tour(tourProps);
  }

  /**
   * Convert Domain Tour entity to Prisma Tour data
   */
static toPrisma(tour: Tour): {
  tour: Omit<PrismaTour, 'createdAt' | 'updatedAt'>;
  startLocation: Prisma.TourLocationCreateWithoutTourInput;
  locations: Prisma.TourLocationCreateWithoutTourInput[];
} {
    const tourId = tour.getId();
    if (!tourId) {
      throw new Error('Tour ID is required for Prisma conversion');
    }

    const tourData: Omit<PrismaTour, 'createdAt' | 'updatedAt'> = {
      id: tourId,
      name: tour.getName(),
      slug: tour.getSlug(),
      duration: tour.getDuration(),
      maxGroupSize: tour.getMaxGroupSize(),
      difficulty: tour.getDifficulty().toUpperCase() as Difficulty,
      ratingsAverage: tour.getRatingsAverage(),
      ratingsQuantity: tour.getRatingsQuantity(),
      priceAmount: new Prisma.Decimal(tour.getPrice().getAmount()),
      currency: tour.getPrice().getCurrency(),
      summary: tour.getSummary(),
      description: tour.getDescription(),
      imageCover: tour.getImageCover(),
      images: tour.getImages(),
      startDates: tour.getStartDates(),
      viewCount: tour.getViewCount(),
    };

    const startLoc = tour.getStartLocation();
    const startLocationData: Prisma.TourLocationCreateWithoutTourInput = {
      description: startLoc.description,
      address: null,
      longitude: startLoc.coordinates[0],
      latitude: startLoc.coordinates[1],
      day: null,
    startTour: {
      connect: { id: tourId },
  },
};

    const locationsData: Prisma.TourLocationCreateWithoutTourInput[] = tour.getLocations().map((loc) => ({
        description: loc.description,
        address: null,
        longitude: loc.coordinates[0],
        latitude: loc.coordinates[1],
        day: loc.day,
      }));

    return {
      tour: tourData,
      startLocation: startLocationData,
      locations: locationsData,
    };
  }
}
