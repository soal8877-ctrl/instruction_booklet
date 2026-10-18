"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Note } from "@prisma/client";
import { Loader2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/dashboard/note-card";
import { NoteDialog } from "@/components/dashboard/note-dialog";

type NoteWithAuthor = Note & {
  author?: { id: string; name: string | null; email: string };
};

type Props = {
  sectionTitle: string;
  notes: NoteWithAuthor[];
  page: number;
  pageCount: number;
  total: number;
  initialQuery: string;
  currentUserId: string;
  canCreate: boolean;
  showOwnerActions: boolean;
};

export function NotesWorkspace({
  sectionTitle,
  notes,
  page,
  pageCount,
  total,
  initialQuery,
  currentUserId,
  canCreate,
  showOwnerActions,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, pathname, router]);

  function goToPage(next: number) {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (next > 1) params.set("page", String(next));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function openCreate() {
    setEditingNote(null);
    setDialogOpen(true);
  }

  function openEdit(note: Note) {
    setEditingNote(note);
    setDialogOpen(true);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <header className="border-b border-slate-100 px-8 py-6">
        <h1 className="text-2xl font-semibold text-slate-900">Личный кабинет</h1>
        <h2 className="mt-1 text-lg text-slate-600">{sectionTitle}</h2>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-8 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Поиск по заголовку и тексту…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {canCreate && (
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Новая заметка
            </Button>
          )}
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>

        {notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
            <p className="text-slate-600">
              {canCreate
                ? "У вас пока нет заметок — создайте первую"
                : "Заметок не найдено"}
            </p>
            {canCreate && (
              <Button className="mt-4" type="button" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Новая заметка
              </Button>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <li key={note.id}>
                <NoteCard
                  note={note}
                  currentUserId={currentUserId}
                  showOwnerActions={showOwnerActions}
                  onEdit={openEdit}
                />
              </li>
            ))}
          </ul>
        )}

        {total > 0 && (
          <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
            <span>
              Страница {page} из {pageCount} · всего {total}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Назад
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => goToPage(page + 1)}
              >
                Вперёд
              </Button>
            </div>
          </div>
        )}
      </div>

      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        note={editingNote}
      />
    </div>
  );
}
