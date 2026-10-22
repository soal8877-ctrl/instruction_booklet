import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { NoteSort, PublicNoteListItem } from "@/lib/notes/types";

export const NOTES_PAGE_SIZE = 10;
export const HOME_NOTES_LIMIT = 12;

const publicNoteInclude = {
  author: { select: { id: true, name: true, email: true } },
  _count: { select: { likes: true } },
} as const;

type ListParams = {
  page: number;
  query?: string;
  sort?: NoteSort;
};

async function attachLikeMeta<T extends { id: string; _count: { likes: number } }>(
  userId: string | undefined,
  rows: T[],
) {
  const noteIds = rows.map((row) => row.id);
  const likedSet = new Set<string>();

  if (userId && noteIds.length > 0) {
    const myLikes = await prisma.like.findMany({
      where: { userId, noteId: { in: noteIds } },
      select: { noteId: true },
    });
    for (const like of myLikes) {
      likedSet.add(like.noteId);
    }
  }

  return rows.map((row) => {
    const { _count, ...note } = row;
    return {
      ...note,
      likesCount: _count.likes,
      likedByMe: likedSet.has(row.id),
    };
  });
}

/** Две выборки для главной: новые и популярные публичные заметки */
export async function getHomePagePublicNotes(userId?: string) {
  const where = { isPublic: true };

  const [recentRows, popularRows] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: HOME_NOTES_LIMIT,
      include: publicNoteInclude,
    }),
    prisma.note.findMany({
      where,
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
      take: HOME_NOTES_LIMIT,
      include: publicNoteInclude,
    }),
  ]);

  const [recentNotes, popularNotes] = await Promise.all([
    attachLikeMeta(userId, recentRows),
    attachLikeMeta(userId, popularRows),
  ]);

  return { recentNotes, popularNotes };
}

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

  const [rows, total] = await Promise.all([
    prisma.note.findMany({
      where,
      // createdAt: порядок карточек не «прыгает» при toggle public/favorite (updatedAt меняется)
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * NOTES_PAGE_SIZE,
      take: NOTES_PAGE_SIZE,
      include: { _count: { select: { likes: true } } },
    }),
    prisma.note.count({ where }),
  ]);

  const items = await attachLikeMeta(userId, rows);

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

  const [rows, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * NOTES_PAGE_SIZE,
      take: NOTES_PAGE_SIZE,
      include: { _count: { select: { likes: true } } },
    }),
    prisma.note.count({ where }),
  ]);

  const items = await attachLikeMeta(userId, rows);

  return {
    items,
    total,
    pageCount: Math.max(1, Math.ceil(total / NOTES_PAGE_SIZE)),
  };
}

export async function listPublicNotes(
  userId: string | undefined,
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

  const items = (await attachLikeMeta(userId, rows)) as PublicNoteListItem[];

  return {
    items,
    total,
    pageCount: Math.max(1, Math.ceil(total / NOTES_PAGE_SIZE)),
    currentUserId: userId ?? null,
    sort,
  };
}

export async function getPublicNoteById(noteId: string, userId?: string) {
  const row = await prisma.note.findUnique({
    where: { id: noteId },
    include: publicNoteInclude,
  });

  if (!row || !row.isPublic) {
    return null;
  }

  const [item] = await attachLikeMeta(userId, [row]);
  return item as PublicNoteListItem;
}
