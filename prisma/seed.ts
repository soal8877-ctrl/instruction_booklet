import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.note.createMany({
    data: [
      { title: "Первая заметка" },
      { title: "Вторая заметка" },
      { title: "Третья заметка" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
