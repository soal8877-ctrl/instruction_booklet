import type { NoteSort } from "@/lib/notes/types";

export function parseListParams(searchParams: {
  q?: string;
  page?: string;
  sort?: string;
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const query = searchParams.q?.trim() ?? "";
  const sort: NoteSort = searchParams.sort === "popular" ? "popular" : "recent";
  return { page, query, sort };
}
