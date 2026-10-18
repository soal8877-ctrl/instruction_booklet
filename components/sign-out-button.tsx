"use client";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <form className="w-full" action={signOutAction}>
      <Button type="submit" variant="secondary" className="w-full">
        Выйти
      </Button>
    </form>
  );
}
