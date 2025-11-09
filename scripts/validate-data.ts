/**
 * Quick data validation script
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Validating database...\n');

  const buildings = await prisma.building.count();
  const properties = await prisma.property.count();
  const activities = await prisma.activity.count();

  console.log(`✅ Buildings: ${buildings}`);
  console.log(`✅ Properties: ${properties}`);
  console.log(`✅ Activities: ${activities}\n`);

  // Group by city
  const byCity = await prisma.building.groupBy({
    by: ['city'],
    _count: true
  });

  console.log('📍 Buildings by city:');
  byCity.forEach(city => {
    console.log(`   ${city.city}: ${city._count} buildings`);
  });

  // Group by urgency
  const byUrgency = await prisma.property.groupBy({
    by: ['urgencyScore'],
    _count: true,
    orderBy: { urgencyScore: 'desc' }
  });

  console.log('\n🚨 Properties by urgency:');
  const urgencyNames: Record<number, string> = {
    5: '🔴 URGENT',
    4: '🟠 WARNING',
    3: '🟡 MONITOR',
    2: '🟢 OPTIMAL',
    1: '🔵 NEW',
    0: '⚫ SOLD'
  };
  byUrgency.forEach(u => {
    console.log(`   ${urgencyNames[u.urgencyScore] || u.urgencyScore}: ${u._count} properties`);
  });

  console.log('\n✨ Validation complete!');
}

main().then(() => prisma.$disconnect());
