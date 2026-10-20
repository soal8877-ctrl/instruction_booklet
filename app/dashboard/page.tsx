import { requireAuth } from "@/lib/auth-helpers";
import { listMyNotes } from "@/lib/notes/queries";
import { parseListParams } from "@/lib/notes/parse-params";
import { NotesWorkspace } from "@/components/dashboard/notes-workspace";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requireAuth();
  const params = parseListParams(await searchParams);
  const { items, total, pageCount } = await listMyNotes(session.user.id, params);

  return (
    <NotesWorkspace
      sectionTitle="Мои заметки"
      notes={items}
      page={params.page}
      pageCount={pageCount}
      total={total}
      initialQuery={params.query}
      currentUserId={session.user.id}
      canCreate
      showOwnerActions
      showLikes
    />
  );
}
