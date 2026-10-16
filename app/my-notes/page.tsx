import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export default async function MyNotesPage() {
  const session = await requireAuth();

  // Заметки только текущего пользователя
  const notes = await prisma.note.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { tags: true },
  });

  return (
    <main>
      <h1>Мои заметки</h1>
      <p className="subtitle">Доступны только ваши записи</p>

      <p className="nav-links">
        <Link href="/dashboard">← Личный кабинет</Link>
      </p>

      {notes.length === 0 ? (
        <p className="empty">У вас пока нет заметок</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              <span>
                {note.tags.length > 0
                  ? note.tags.map((tag) => tag.name).join(", ")
                  : "без тегов"}
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
