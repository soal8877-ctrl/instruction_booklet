"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { noteFormSchema, noteIdSchema } from "@/lib/validations/note";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/public",
  "/dashboard/favorites",
];

function revalidateDashboard() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

/** Только владелец может менять заметку */
async function getOwnedNote(noteId: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.authorId !== userId) {
    throw new Error("Нет доступа к этой заметке");
  }
  return note;
}

export async function createNote(input: unknown) {
  const session = await requireAuth();
  const data = noteFormSchema.parse(input);

  await prisma.note.create({
    data: {
      title: data.title,
      content: data.content ?? "",
      isPublic: data.isPublic ?? false,
      authorId: session.user.id,
    },
  });

  revalidateDashboard();
  return { ok: true as const };
}

export async function updateNote(noteId: string, input: unknown) {
  const session = await requireAuth();
  noteIdSchema.parse({ id: noteId });
  const data = noteFormSchema.parse(input);
  await getOwnedNote(noteId, session.user.id);

  await prisma.note.update({
    where: { id: noteId },
    data: {
      title: data.title,
      content: data.content ?? "",
      isPublic: data.isPublic ?? false,
    },
  });

  revalidateDashboard();
  return { ok: true as const };
}

export async function deleteNote(noteId: string) {
  const session = await requireAuth();
  noteIdSchema.parse({ id: noteId });
  await getOwnedNote(noteId, session.user.id);

  await prisma.note.delete({ where: { id: noteId } });
  revalidateDashboard();
  return { ok: true as const };
}

export async function toggleNotePublic(noteId: string) {
  const session = await requireAuth();
  noteIdSchema.parse({ id: noteId });
  const note = await getOwnedNote(noteId, session.user.id);

  await prisma.note.update({
    where: { id: noteId },
    data: { isPublic: !note.isPublic },
  });

  revalidateDashboard();
  return { ok: true as const, isPublic: !note.isPublic };
}

export async function toggleNoteFavorite(noteId: string) {
  const session = await requireAuth();
  noteIdSchema.parse({ id: noteId });
  const note = await getOwnedNote(noteId, session.user.id);

  await prisma.note.update({
    where: { id: noteId },
    data: { isFavorite: !note.isFavorite },
  });

  revalidateDashboard();
  return { ok: true as const, isFavorite: !note.isFavorite };
}
