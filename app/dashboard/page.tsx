import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <main>
      <h1>Личный кабинет</h1>
      <p className="subtitle">Вы вошли как {session.user.name ?? session.user.email}</p>

      <ul className="nav-links">
        <li>
          <Link href="/my-notes">Мои заметки</Link>
        </li>
        <li>
          <Link href="/">Главная</Link>
        </li>
      </ul>

      <p className="meta">userId: {session.user.id}</p>

      <SignOutButton />
    </main>
  );
}
