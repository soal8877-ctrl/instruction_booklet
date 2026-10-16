import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Middleware защищает /dashboard и /my-notes.
 * Логика редиректа описана в auth.config.ts → callbacks.authorized.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/my-notes/:path*", "/login"],
};
