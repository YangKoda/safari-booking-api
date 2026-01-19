import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create connection pool and adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    console.log('🧹 Cleaning existing data...');
    await prisma.review.deleteMany();
    await prisma.inquiry.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared');

    console.log('\n📝 Note: Seed data will be added in Phase 4.5');
    console.log('   - Tours (10-15 realistic safaris)');
    console.log('   - Users (20-30 customers + admins)');
    console.log('   - Inquiries (50+ bookings)');
    console.log('   - Reviews (30+ reviews)');

    console.log('\n✅ Database seed structure ready!');
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
