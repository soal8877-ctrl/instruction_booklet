import Link from "next/link";
import { getOptionalSession } from "@/lib/auth-helpers";
import { listPublicNotes } from "@/lib/notes/queries";
import { parseListParams } from "@/lib/notes/parse-params";
import { PublicNoteCard } from "@/components/home/public-note-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const session = await getOptionalSession();
  const params = parseListParams(await searchParams);
  const { items, total, pageCount, sort } = await listPublicNotes(session?.user?.id, params);

  const baseQuery = new URLSearchParams();
  if (params.query) baseQuery.set("q", params.query);
  if (params.page > 1) baseQuery.set("page", String(params.page));

  function pageHref(nextPage: number, nextSort: "recent" | "popular") {
    const q = new URLSearchParams(baseQuery);
    q.set("sort", nextSort);
    if (nextPage > 1) q.set("page", String(nextPage));
    const s = q.toString();
    return s ? `/catalog?${s}` : `/catalog?sort=${nextSort}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Каталог</h1>
          <p className="mt-2 text-muted-foreground">
            Все публичные заметки. Редактирование доступно только в личном кабинете.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            variant={sort === "recent" ? "default" : "outline"}
            size="sm"
          >
            <Link href={pageHref(1, "recent")}>Новые</Link>
          </Button>
          <Button
            asChild
            variant={sort === "popular" ? "default" : "outline"}
            size="sm"
          >
            <Link href={pageHref(1, "popular")}>Популярные</Link>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-muted-foreground">
          Ничего не найдено.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((note) => (
            <li key={note.id}>
              <PublicNoteCard note={note} />
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          aria-label="Пагинация"
        >
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p, sort)}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm",
                p === params.page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-accent",
              )}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">Всего: {total}</p>
    </div>
  );
}
