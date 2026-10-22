import Link from "next/link";
import { PublicNoteCard } from "@/components/home/public-note-card";
import type { PublicNoteListItem } from "@/lib/notes/types";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  notes: PublicNoteListItem[];
  catalogSort?: "recent" | "popular";
};

export function NotesSection({ title, description, notes, catalogSort }: Props) {
  const catalogHref = catalogSort ? `/catalog?sort=${catalogSort}` : "/catalog";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="self-start sm:self-auto">
          <Link href={catalogHref}>Смотреть все</Link>
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          Публичных заметок пока нет. Войдите и опубликуйте первую в личном кабинете.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <li key={note.id} className="min-h-0">
              <PublicNoteCard note={note} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
