"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { formatShortName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage: string | null | undefined;
};

export function HeaderUserMenu({ userName, userEmail, userImage }: Props) {
  const shortName = formatShortName(userName, userEmail);
  const initials = shortName.slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-2 sm:px-3">
          {userImage ? (
            <Image
              src={userImage}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800">
              {initials}
            </span>
          )}
          <span className="hidden max-w-[140px] truncate text-sm font-medium sm:inline">
            {shortName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Мои заметки
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            const form = document.getElementById("header-sign-out-form") as HTMLFormElement | null;
            form?.requestSubmit();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
      <form id="header-sign-out-form" action={signOutAction} className="hidden" />
    </DropdownMenu>
  );
}
