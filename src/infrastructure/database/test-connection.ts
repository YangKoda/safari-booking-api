import prisma from './prisma';

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Test query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('✅ Query test successful:', result);

    // Count tables
    const tours = await prisma.tour.count();
    const users = await prisma.user.count();
    const inquiries = await prisma.inquiry.count();
    const reviews = await prisma.review.count();

    console.log('\n📊 Database Status:');
    console.log(`   Tours: ${tours}`);
    console.log(`   Users: ${users}`);
    console.log(`   Inquiries: ${inquiries}`);
    console.log(`   Reviews: ${reviews}`);

    await prisma.$disconnect();
    console.log('\n✅ Test complete! Database is ready.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
