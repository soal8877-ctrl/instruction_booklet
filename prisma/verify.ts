import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = `verify-${Date.now()}@example.com`;

  const user = await prisma.user.create({
    data: {
      email,
      name: "Тестовый пользователь",
    },
  });

  const note = await prisma.note.create({
    data: {
      title: "Тестовая заметка (verify)",
      authorId: user.id,
      tags: {
        connectOrCreate: {
          where: { name: "verify" },
          create: { name: "verify" },
        },
      },
    },
    include: { author: true, tags: true },
  });

  console.log("OK: пользователь и заметка созданы");
  console.log({ userId: user.id, noteId: note.id, tags: note.tags.map((t) => t.name) });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Ошибка проверки:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
