import { PrismaClient } from '@prisma/client';
import { ALL_TOURS } from './data/tourData';

export class TourSeeder {
  constructor(private prisma: PrismaClient) {}

  async seed(): Promise<void> {
    console.log(`🦁 Seeding ${ALL_TOURS.length} tours...`);

    for (let i = 0; i < ALL_TOURS.length; i++) {
      const tourData = ALL_TOURS[i];

      try {
        // Create tour
        const tour = await this.prisma.tour.create({
          data: {
            name: tourData.name,
            slug: tourData.slug,
            description: tourData.description,
            summary: tourData.summary,
            duration: tourData.duration,
            maxGroupSize: tourData.maxGroupSize,
            priceAmount: tourData.priceAmount,
            currency: tourData.currency,
            difficulty: tourData.difficulty,
            imageCover: tourData.imageCover,
            images: tourData.images,
            startDates: tourData.startDates,
            ratingsAverage: 0,
            ratingsQuantity: 0,
          },
        });

        // Create start location
        await this.prisma.tourLocation.create({
          data: {
            description: tourData.startLocation.description,
            address: tourData.startLocation.address,
            longitude: tourData.startLocation.longitude,
            latitude: tourData.startLocation.latitude,
            startTourId: tour.id,
            tourId: tour.id,
          },
        });

        // Create tour locations (stops)
        for (const location of tourData.locations) {
          await this.prisma.tourLocation.create({
            data: {
              description: location.description,
              address: location.address,
              longitude: location.longitude,
              latitude: location.latitude,
              day: location.day,
              tourId: tour.id,
            },
          });
        }

        console.log(`  ✓ Created tour ${i + 1}/${ALL_TOURS.length}: ${tour.name}`);
      } catch (error) {
        console.error(`  ✗ Failed to create tour: ${tourData.name}`, error);
        throw error;
      }
    }

    console.log(`✅ Successfully seeded ${ALL_TOURS.length} tours`);
  }
}
