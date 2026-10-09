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

  const tagNames = ["работа", "личное", "идеи"];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const titles = ["Первая заметка", "Вторая заметка", "Третья заметка"];

  for (const [index, title] of titles.entries()) {
    const existing = await prisma.note.findFirst({
      where: { title, authorId: user.id },
    });
    if (existing) continue;

    await prisma.note.create({
      data: {
        title,
        authorId: user.id,
        tags: {
          connect: [{ id: tags[index % tags.length].id }],
        },
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
