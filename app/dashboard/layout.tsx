import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar
        userName={session.user.name}
        userEmail={session.user.email}
        userImage={session.user.image}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center p-8 text-slate-500">
              Загрузка…
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
