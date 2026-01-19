import { PrismaClient } from '@prisma/client';
import { getRandomRating, getReviewByRating } from './data/reviewData';

export class ReviewSeeder {
  constructor(private prisma: PrismaClient) {}

  async seed(): Promise<void> {
    console.log(`⭐ Seeding reviews...`);

    // Get completed inquiries only
    const completedInquiries = await this.prisma.inquiry.findMany({
      where: { status: 'COMPLETED' },
      include: { tour: true, user: true },
    });

    if (completedInquiries.length === 0) {
      console.log('⚠️  No completed inquiries found. Skipping review seeding.');
      return;
    }

    // Create reviews for 60% of completed inquiries
    const reviewCount = Math.floor(completedInquiries.length * 0.6);
    const selectedInquiries = completedInquiries
      .sort(() => Math.random() - 0.5)
      .slice(0, reviewCount);

    for (let i = 0; i < selectedInquiries.length; i++) {
      const inquiry = selectedInquiries[i];

      try {
        const rating = getRandomRating();
        const comment = getReviewByRating(rating);

        await this.prisma.review.create({
          data: {
            rating,
            comment,
            tourId: inquiry.tourId,
            userId: inquiry.userId!,
          },
        });

        console.log(
          `  ✓ Created review ${i + 1}/${selectedInquiries.length}: ${rating} stars for ${inquiry.tour.name}`
        );
      } catch (error) {
        console.error(`  ✗ Failed to create review`, error);
      }
    }

    // Update tour ratings
    console.log('  📊 Updating tour aggregate ratings...');
    await this.updateTourRatings();

    console.log(`✅ Successfully seeded ${selectedInquiries.length} reviews`);
  }

  private async updateTourRatings(): Promise<void> {
    const tours = await this.prisma.tour.findMany({
      include: { reviews: true },
    });

    for (const tour of tours) {
      if (tour.reviews.length > 0) {
        const totalRating = tour.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / tour.reviews.length;

        await this.prisma.tour.update({
          where: { id: tour.id },
          data: {
            ratingsAverage: averageRating,
            ratingsQuantity: tour.reviews.length,
          },
        });
      }
    }
  }
}
