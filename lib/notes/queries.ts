import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { NoteSort, PublicNoteListItem } from "@/lib/notes/types";

export const NOTES_PAGE_SIZE = 10;

type ListParams = {
  page: number;
  query?: string;
  sort?: NoteSort;
};

function searchFilter(query?: string) {
  if (!query?.trim()) return undefined;
  const q = query.trim();
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

export async function listMyNotes(userId: string, { page, query }: ListParams) {
  const where = {
    authorId: userId,
    ...(searchFilter(query) ?? {}),
  };

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * NOTES_PAGE_SIZE,
      take: NOTES_PAGE_SIZE,
    }),
    prisma.note.count({ where }),
  ]);

  return {
    items,
    total,
    pageCount: Math.max(1, Math.ceil(total / NOTES_PAGE_SIZE)),
  };
}

export async function listFavoriteNotes(userId: string, { page, query }: ListParams) {
  const where = {
    authorId: userId,
    isFavorite: true,
    ...(searchFilter(query) ?? {}),
  };

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * NOTES_PAGE_SIZE,
      take: NOTES_PAGE_SIZE,
    }),
    prisma.note.count({ where }),
  ]);

  return {
    items,
    total,
    pageCount: Math.max(1, Math.ceil(total / NOTES_PAGE_SIZE)),
  };
}

export async function listPublicNotes(
  userId: string,
  { page, query, sort = "recent" }: ListParams,
) {
  const where = {
    isPublic: true,
    ...(searchFilter(query) ?? {}),
  };

  const orderBy: Prisma.NoteOrderByWithRelationInput[] | Prisma.NoteOrderByWithRelationInput =
    sort === "popular"
      ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
      : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy,
      skip: (page - 1) * NOTES_PAGE_SIZE,
      take: NOTES_PAGE_SIZE,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.note.count({ where }),
  ]);

  const noteIds = rows.map((row) => row.id);
  const myLikes =
    noteIds.length === 0
      ? []
      : await prisma.like.findMany({
          where: { userId, noteId: { in: noteIds } },
          select: { noteId: true },
        });
  const likedSet = new Set(myLikes.map((like) => like.noteId));

  const items: PublicNoteListItem[] = rows.map((row) => {
    const { _count, ...note } = row;
    return {
      ...note,
      likesCount: _count.likes,
      likedByMe: likedSet.has(row.id),
    };
  });

  return {
    items,
    total,
    pageCount: Math.max(1, Math.ceil(total / NOTES_PAGE_SIZE)),
    currentUserId: userId,
    sort,
  };
}
