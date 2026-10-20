import { requireAuth } from "@/lib/auth-helpers";
import { listPublicNotes } from "@/lib/notes/queries";
import { parseListParams } from "@/lib/notes/parse-params";
import { NotesWorkspace } from "@/components/dashboard/notes-workspace";

export default async function PublicNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const session = await requireAuth();
  const params = parseListParams(await searchParams);
  const { items, total, pageCount, sort } = await listPublicNotes(
    session.user.id,
    params,
  );

  return (
    <NotesWorkspace
      sectionTitle="Публичные заметки"
      notes={items}
      page={params.page}
      pageCount={pageCount}
      total={total}
      initialQuery={params.query}
      initialSort={sort}
      currentUserId={session.user.id}
      canCreate={false}
      showOwnerActions
      showLikes
      showSort
    />
  );
}
