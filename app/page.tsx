import Link from "next/link";
import { getOptionalSession } from "@/lib/auth-helpers";

export default async function HomePage() {
  const session = await getOptionalSession();

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Instruction Booklet</h1>
      <p className="mt-2 text-slate-600">SaaS для хранения инструкций и заметок</p>

      {session?.user ? (
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-white"
        >
          Личный кабинет
        </Link>
      ) : (
        <Link href="/login" className="mt-6 inline-block text-primary underline">
          Войти через Google
        </Link>
      )}
    </main>
  );
}
