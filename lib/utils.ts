import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Имя для сайдбара: «Антон Л.» */
export function formatShortName(fullName: string | null | undefined, email?: string | null) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const lastInitial = parts[1]?.[0] ? ` ${parts[1][0]}.` : "";
    return `${parts[0]}${lastInitial}`;
  }
  return email?.split("@")[0] ?? "Пользователь";
}
