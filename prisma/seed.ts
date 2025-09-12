import { PrismaClient } from './generated/client.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NobleHuman database...');

  // TODO

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
