import Link from "next/link";
import { BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeaderUserMenu } from "@/components/layout/header-user-menu";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/dashboard", label: "Мои заметки" },
];

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:h-16 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="hidden text-sm sm:inline sm:text-base">instruction booklet</span>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3 sm:text-sm",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {user?.id ? (
            <HeaderUserMenu
              userName={user.name}
              userEmail={user.email}
              userImage={user.image}
            />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Войти</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
