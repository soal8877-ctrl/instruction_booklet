import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, tags: true },
  });

  return (
    <main>
      <h1>Заметки</h1>
      <p className="subtitle">Данные из PostgreSQL (Neon) через Prisma</p>

      {notes.length === 0 ? (
        <p className="empty">Заметок пока нет. Запустите seed: npm run db:seed</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              <span>
                {note.author.name ?? note.author.email}
                {note.tags.length > 0
                  ? ` · ${note.tags.map((tag) => tag.name).join(", ")}`
                  : ""}
              </span>
              <time dateTime={note.createdAt.toISOString()}>
                {note.createdAt.toLocaleString("ru-RU")}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
