import Link from "next/link";
import { getOptionalSession } from "@/lib/auth-helpers";

export default async function HomePage() {
  const session = await getOptionalSession();

  return (
    <main>
      <h1>Instruction Booklet</h1>
      <p className="subtitle">SaaS для хранения инструкций и заметок</p>

      {session?.user ? (
        <ul className="nav-links">
          <li>
            <Link href="/dashboard">Личный кабинет</Link>
          </li>
          <li>
            <Link href="/my-notes">Мои заметки</Link>
          </li>
        </ul>
      ) : (
        <p className="nav-links">
          <Link href="/login">Войти через Google</Link>
        </p>
      )}
    </main>
  );
}
