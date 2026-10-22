import Link from "next/link";
import { notFound } from "next/navigation";
import { getOptionalSession } from "@/lib/auth-helpers";
import { getPublicNoteById } from "@/lib/notes/queries";
import { LikeButton } from "@/components/dashboard/like-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNoteDate, formatShortName } from "@/lib/utils";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getOptionalSession();
  const note = await getPublicNoteById(id, session?.user?.id);

  if (!note) {
    notFound();
  }

  const authorLabel = formatShortName(note.author?.name, note.author?.email);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/catalog">← К каталогу</Link>
      </Button>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl sm:text-3xl">{note.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{authorLabel}</span>
            <span aria-hidden>·</span>
            <time dateTime={new Date(note.createdAt).toISOString()}>
              {formatNoteDate(note.createdAt)}
            </time>
          </div>
          <div className="pt-1">
            <LikeButton
              noteId={note.id}
              initialLiked={note.likedByMe}
              initialCount={note.likesCount}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
            {note.content.trim() || "Автор пока не добавил текст."}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
