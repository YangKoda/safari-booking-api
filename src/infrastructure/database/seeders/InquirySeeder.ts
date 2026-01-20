import { PrismaClient, InquiryStatus } from '@prisma/client';
import { getRandomSpecialRequest, generatePhoneNumber, getRandomCountry } from './data/inquiryData';

export class InquirySeeder {
  constructor(private prisma: PrismaClient) {}

  async seed(): Promise<void> {
    console.log(`📅 Seeding inquiries...`);

    // Get all tours and customers
    const tours = await this.prisma.tour.findMany();
    const customers = await this.prisma.user.findMany({
      where: { role: 'USER' },
    });

    if (tours.length === 0 || customers.length === 0) {
      console.log('⚠️  No tours or customers found. Skipping inquiry seeding.');
      return;
    }

    const statusDistribution: InquiryStatus[] = [
      ...Array(10).fill('CONFIRMED'),
      ...Array(7).fill('PENDING'),
      ...Array(5).fill('COMPLETED'),
      ...Array(5).fill('CANCELLED'),
    ];

    let inquiryCount = 0;

    for (const status of statusDistribution) {
      try {
        // Random tour and customer
        const tour = tours[Math.floor(Math.random() * tours.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];

        // Number of people (1-6)
        const numberOfPeople = Math.floor(Math.random() * 6) + 1;

        // Calculate price
        const totalPrice = Number(tour.priceAmount) * numberOfPeople;

        // Generate date based on status
        let preferredStartDate: Date;
        if (status === 'COMPLETED') {
          // Past date (1-60 days ago)
          const daysAgo = Math.floor(Math.random() * 60) + 1;
          preferredStartDate = new Date();
          preferredStartDate.setDate(preferredStartDate.getDate() - daysAgo);
        } else {
          // Future date (10-180 days from now)
          const daysAhead = Math.floor(Math.random() * 170) + 10;
          preferredStartDate = new Date();
          preferredStartDate.setDate(preferredStartDate.getDate() + daysAhead);
        }

          // End date = start date + 3–10 days
          const tripDays = Math.floor(Math.random() * 8) + 3;
          const preferredEndDate = new Date(preferredStartDate);
          preferredEndDate.setDate(preferredEndDate.getDate() + tripDays);


        // Create inquiry with random worldwide phone format
        await this.prisma.inquiry.create({
          data: {
            customerName: customer.name,
            customerEmail: customer.email,
            phone: generatePhoneNumber(getRandomCountry()),
            numberOfPeople,
            tourId: tour.id,
            userId: customer.id,
            preferredStartDate,
            preferredEndDate,
            status,
            totalPrice,
            currency: tour.currency,
            specialRequests: getRandomSpecialRequest(),
          },
        });

        inquiryCount++;
        console.log(`  ✓ Created inquiry ${inquiryCount}: ${status} - ${tour.name}`);
      } catch (error) {
        console.error(`  ✗ Failed to create inquiry`, error);
      }
    }

    console.log(`✅ Successfully seeded ${inquiryCount} inquiries`);
  }
}
