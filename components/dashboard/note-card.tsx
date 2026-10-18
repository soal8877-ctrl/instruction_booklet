"use client";

import { useTransition } from "react";
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

type NoteWithAuthor = Note & {
  author?: { id: string; name: string | null; email: string };
};

type Props = {
  note: NoteWithAuthor;
  currentUserId: string;
  /** Показывать кнопки владельца (редактирование, удаление) */
  showOwnerActions: boolean;
  onEdit: (note: Note) => void;
};

export function NoteCard({ note, currentUserId, showOwnerActions, onEdit }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isOwner = note.authorId === currentUserId;

  const preview =
    note.content.trim() ||
    "Нет описания — добавьте текст заметки при редактировании.";

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <article
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
        {isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(note.isFavorite && "text-amber-500")}
            title="Избранное"
            onClick={() => run(() => toggleNoteFavorite(note.id))}
          >
            <Star className={cn("h-4 w-4", note.isFavorite && "fill-current")} />
          </Button>
        )}

        {showOwnerActions && isOwner && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={note.isPublic ? "Сделать приватной" : "Сделать публичной"}
              onClick={() => run(() => toggleNotePublic(note.id))}
            >
              {note.isPublic ? (
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
