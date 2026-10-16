import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();

  // Уже авторизован — в личный кабинет
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <h1>Вход</h1>
      <p className="subtitle">Войдите через Google, чтобы открыть личный кабинет</p>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button type="submit" className="btn-google">Войти через Google</button>
      </form>

      <p className="auth-footer">
        <Link href="/">На главную</Link>
      </p>
    </main>
  );
}
