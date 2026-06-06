import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const columns = await prisma.$queryRawUnsafe(`
    SHOW COLUMNS FROM Game
  `);

  console.log(columns);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });