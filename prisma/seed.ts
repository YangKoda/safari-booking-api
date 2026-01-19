import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { TourSeeder } from '../src/infrastructure/database/seeders/TourSeeder';
import { UserSeeder } from '../src/infrastructure/database/seeders/UserSeeder';
import { InquirySeeder } from '../src/infrastructure/database/seeders/InquirySeeder';
import { ReviewSeeder } from '../src/infrastructure/database/seeders/ReviewSeeder';

// Load environment variables
dotenv.config();

// Create connection pool and adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clean database
    console.log('🧹 Cleaning existing data...');
    await prisma.review.deleteMany();
    await prisma.inquiry.deleteMany();
    await prisma.tourGuide.deleteMany();
    await prisma.tourLocation.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');

    // Seed Tours
    const tourSeeder = new TourSeeder(prisma);
    await tourSeeder.seed();
    console.log();

    // Seed Users
    const userSeeder = new UserSeeder(prisma);
    await userSeeder.seed();
    console.log();

    // Seed Inquiries
    const inquirySeeder = new InquirySeeder(prisma);
    await inquirySeeder.seed();
    console.log();

    // Seed Reviews
    const reviewSeeder = new ReviewSeeder(prisma);
    await reviewSeeder.seed();
    console.log();

    // Show summary
    const counts = {
      tours: await prisma.tour.count(),
      users: await prisma.user.count(),
      inquiries: await prisma.inquiry.count(),
      reviews: await prisma.review.count(),
    };

    console.log('📊 Seed Summary:');
    console.log(`   Tours: ${counts.tours}`);
    console.log(`   Users: ${counts.users}`);
    console.log(`   Inquiries: ${counts.inquiries}`);
    console.log(`   Reviews: ${counts.reviews}`);
    console.log('\n✅ Database seed complete! 🎉');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
