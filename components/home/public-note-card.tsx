import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LikeButton } from "@/components/dashboard/like-button";
import type { PublicNoteListItem } from "@/lib/notes/types";
import { formatNoteDate, formatShortName } from "@/lib/utils";

type Props = {
  note: PublicNoteListItem;
};

export function PublicNoteCard({ note }: Props) {
  const authorLabel = formatShortName(note.author?.name, note.author?.email);
  const preview =
    note.content.trim() ||
    "Краткое описание появится, когда автор добавит текст заметки.";

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="line-clamp-2 text-base leading-snug">{note.title}</CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{authorLabel}</span>
          <span aria-hidden>·</span>
          <time dateTime={new Date(note.createdAt).toISOString()}>{formatNoteDate(note.createdAt)}</time>
        </div>
        {note.isPublic && (
          <Badge variant="outline" className="w-fit border-sky-200 bg-sky-50 text-sky-800">
            Публичная
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm text-muted-foreground">{preview}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/notes/${note.id}`}>Открыть</Link>
        </Button>
        <LikeButton
          noteId={note.id}
          initialLiked={note.likedByMe}
          initialCount={note.likesCount}
        />
      </CardFooter>
    </Card>
  );
}
