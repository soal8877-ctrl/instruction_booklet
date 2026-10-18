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
      content: "Проверка создания заметки с новой схемой.",
      authorId: user.id,
      isPublic: true,
    },
  });

  console.log("OK: пользователь и заметка созданы");
  console.log({ userId: user.id, noteId: note.id });
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
