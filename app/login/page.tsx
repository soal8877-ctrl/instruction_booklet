import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold">Вход</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Войдите через Google, чтобы открыть личный кабинет
      </p>

      <form
        className="mt-8 w-full"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <Button type="submit" className="w-full">Войти через Google</Button>
      </form>

      <Link href="/" className="mt-6 text-sm text-primary underline">
        На главную
      </Link>
    </main>
  );
}
