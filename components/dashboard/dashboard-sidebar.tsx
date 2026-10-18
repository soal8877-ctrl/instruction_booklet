"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  History,
  MessageSquare,
  Settings,
  Star,
} from "lucide-react";
import { cn, formatShortName } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";

const navItems = [
  { href: "/dashboard", label: "Заметки", icon: MessageSquare, exact: true },
  { href: "/dashboard/favorites", label: "Избранное", icon: Star },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
  { href: "/dashboard/public", label: "Публичные", icon: Bookmark },
];

type Props = {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage: string | null | undefined;
};

export function DashboardSidebar({ userName, userEmail, userImage }: Props) {
  const pathname = usePathname();
  const shortName = formatShortName(userName, userEmail);
  const initials = shortName.slice(0, 1).toUpperCase();

  return (
    <aside
      className="flex w-[280px] shrink-0 flex-col border-r border-sky-200/60 bg-gradient-to-b from-sky-100 via-sky-50 to-slate-50 px-4 py-6"
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        {userImage ? (
          <Image
            src={userImage}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-200 text-lg font-semibold text-sky-900">
            {initials}
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-800">{shortName}</p>
          <p className="text-xs text-slate-500">Личный кабинет</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/80 text-sky-900 shadow-sm ring-1 ring-sky-200/80"
                  : "text-slate-600 hover:bg-white/50 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 px-2">
        <SignOutButton />
      </div>
    </aside>
  );
}
