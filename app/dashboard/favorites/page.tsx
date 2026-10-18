import { requireAuth } from "@/lib/auth-helpers";
import { listFavoriteNotes } from "@/lib/notes/queries";
import { parseListParams } from "@/lib/notes/parse-params";
import { NotesWorkspace } from "@/components/dashboard/notes-workspace";

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requireAuth();
  const params = parseListParams(await searchParams);
  const { items, total, pageCount } = await listFavoriteNotes(session.user.id, params);

  return (
    <NotesWorkspace
      sectionTitle="Избранное"
      notes={items}
      page={params.page}
      pageCount={pageCount}
      total={total}
      initialQuery={params.query}
      currentUserId={session.user.id}
      canCreate={false}
      showOwnerActions
    />
  );
}
