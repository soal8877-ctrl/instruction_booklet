import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Демо-пользователь",
    },
  });

  const samples = [
    {
      title: "Первая заметка",
      content: "Краткое описание первой заметки для демонстрации списка.",
      isPublic: true,
      isFavorite: true,
    },
    {
      title: "Вторая заметка",
      content: "Приватная заметка только для владельца.",
      isPublic: false,
      isFavorite: false,
    },
    {
      title: "Третья заметка",
      content: "Ещё один пример с текстом превью в карточке.",
      isPublic: false,
      isFavorite: true,
    },
  ];

  for (const sample of samples) {
    const existing = await prisma.note.findFirst({
      where: { title: sample.title, authorId: user.id },
    });
    if (existing) continue;

    await prisma.note.create({
      data: {
        ...sample,
        authorId: user.id,
      },
    });
  }
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
