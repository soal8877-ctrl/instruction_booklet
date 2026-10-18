export function parseListParams(searchParams: { q?: string; page?: string }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const query = searchParams.q?.trim() ?? "";
  return { page, query };
}
