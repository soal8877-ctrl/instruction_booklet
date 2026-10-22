import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted-foreground">© instruction booklet, {year}</p>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/policy" className="text-muted-foreground hover:text-foreground">
            Политика
          </Link>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <Link href="/contacts" className="text-muted-foreground hover:text-foreground">
            Контакты
          </Link>
        </div>
      </div>
    </footer>
  );
}
