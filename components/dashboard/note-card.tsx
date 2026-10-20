"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Note } from "@prisma/client";
import {
  Globe,
  Lock,
  MessageSquare,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  deleteNote,
  toggleNoteFavorite,
  toggleNotePublic,
} from "@/lib/actions/notes";
import { LikeButton } from "@/components/dashboard/like-button";
import type { NoteWithAuthor } from "@/lib/notes/types";

type Props = {
  note: NoteWithAuthor;
  currentUserId: string;
  showOwnerActions: boolean;
  showLike?: boolean;
  likesCount?: number;
  likedByMe?: boolean;
  onEdit: (note: Note) => void;
};

export function NoteCard({
  note,
  currentUserId,
  showOwnerActions,
  showLike = false,
  likesCount = 0,
  likedByMe = false,
  onEdit,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite);
  const isOwner = note.authorId === currentUserId;

  useEffect(() => {
    setIsPublic(note.isPublic);
    setIsFavorite(note.isFavorite);
  }, [note.id, note.isPublic, note.isFavorite]);

  const preview =
    note.content.trim() ||
    "Нет описания — добавьте текст заметки при редактировании.";

  function run(action: () => Promise<unknown>, rollback?: () => void) {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch {
        rollback?.();
      }
    });
  }

  return (
    <article
      key={note.id}
      className={cn(
        "flex gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        pending && "opacity-70",
      )}
    >
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
        <MessageSquare className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">{note.title}</h3>
        {!isOwner && note.author && (
          <p className="mt-0.5 text-xs text-slate-500">
            {note.author.name ?? note.author.email}
          </p>
        )}
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{preview}</p>
      </div>

      <div className="flex shrink-0 items-start gap-1">
        {showLike && isPublic && (
          <LikeButton
            noteId={note.id}
            initialLiked={likedByMe}
            initialCount={likesCount}
          />
        )}

        {isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(isFavorite && "text-amber-500")}
            title="Избранное"
            onClick={() => {
              const prev = isFavorite;
              setIsFavorite(!prev);
              run(() => toggleNoteFavorite(note.id), () => setIsFavorite(prev));
            }}
          >
            <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
        )}

        {showOwnerActions && isOwner && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={isPublic ? "Сделать приватной" : "Сделать публичной"}
              onClick={() => {
                const prev = isPublic;
                setIsPublic(!prev);
                run(() => toggleNotePublic(note.id), () => setIsPublic(prev));
              }}
            >
              {isPublic ? (
                <Globe className="h-4 w-4 text-emerald-600" />
              ) : (
                <Lock className="h-4 w-4 text-slate-500" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Редактировать"
              onClick={() => onEdit(note)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Удалить"
              onClick={() => {
                if (!confirm("Удалить эту заметку?")) return;
                run(() => deleteNote(note.id));
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
