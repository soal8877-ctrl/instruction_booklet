import { prisma } from "@/lib/prisma";

export const NOTES_PAGE_SIZE = 10;

type ListParams = {
  page: number;
  query?: string;
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

export async function listPublicNotes(userId: string, { page, query }: ListParams) {
  const where = {
    isPublic: true,
    ...(searchFilter(query) ?? {}),
  };

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * NOTES_PAGE_SIZE,
      take: NOTES_PAGE_SIZE,
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.note.count({ where }),
  ]);

  return {
    items,
    total,
    pageCount: Math.max(1, Math.ceil(total / NOTES_PAGE_SIZE)),
    currentUserId: userId,
  };
}
