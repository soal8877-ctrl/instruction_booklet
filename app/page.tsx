import Link from "next/link";
import { getOptionalSession } from "@/lib/auth-helpers";
import { getHomePagePublicNotes } from "@/lib/notes/queries";
import { NotesSection } from "@/components/home/notes-section";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function HomePage() {
  const session = await getOptionalSession();
  const userId = session?.user?.id;
  const { recentNotes, popularNotes } = await getHomePagePublicNotes(userId);

  return (
    <div className="bg-gradient-to-b from-sky-50/80 via-background to-background">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Инструкции и заметки — в одном месте
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Читайте публичные материалы сообщества или ведите свои заметки в личном кабинете.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            {userId ? (
              <Button asChild className="h-11 px-6 text-base">
                <Link href="/dashboard">Добавить заметку</Link>
              </Button>
            ) : (
              <>
                <Button asChild className="h-11 px-6 text-base">
                  <Link href="/login">Добавить заметку</Link>
                </Button>
                <p className="text-sm text-muted-foreground">Войдите, чтобы добавлять</p>
              </>
            )}
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        <NotesSection
          title="Новые"
          description="Последние опубликованные заметки"
          notes={recentNotes}
          catalogSort="recent"
        />
        <NotesSection
          title="Популярные"
          description="Больше всего лайков от читателей"
          notes={popularNotes}
          catalogSort="popular"
        />
      </div>
    </div>
  );
}
