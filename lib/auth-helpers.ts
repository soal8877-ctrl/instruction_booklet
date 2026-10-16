import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Server-side проверка сессии для защищённых страниц и действий.
 * Пример использования: const session = await requireAuth();
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

/**
 * Пример проверки без редиректа (для условного UI).
 */
export async function getOptionalSession() {
  return auth();
}
