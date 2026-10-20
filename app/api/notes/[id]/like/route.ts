import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Toggle лайка публичной заметки.
 * Идемпотентность по смыслу: повторный вызов снимает лайк.
 */
export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Войдите в аккаунт, чтобы ставить лайки" },
      { status: 401 },
    );
  }

  const { id: noteId } = await context.params;

  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, isPublic: true },
    });

    if (!note || !note.isPublic) {
      return NextResponse.json(
        { error: "Заметка не найдена или недоступна" },
        { status: 404 },
      );
    }

    const userId = session.user.id;
    const existing = await prisma.like.findUnique({
      where: { userId_noteId: { userId, noteId } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.like.delete({
        where: { userId_noteId: { userId, noteId } },
      });
      liked = false;
    } else {
      await prisma.like.create({
        data: { userId, noteId },
      });
      liked = true;
    }

    const likesCount = await prisma.like.count({ where: { noteId } });

    return NextResponse.json({ liked, likesCount });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Уникальный индекс — гонка двух одновременных лайков
      if (error.code === "P2002") {
        const likesCount = await prisma.like.count({ where: { noteId } });
        return NextResponse.json({ liked: true, likesCount });
      }
    }

    console.error("[POST /api/notes/[id]/like]", error);
    return NextResponse.json(
      { error: "Попробуйте позже" },
      { status: 503 },
    );
  }
}
