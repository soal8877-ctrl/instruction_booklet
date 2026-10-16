import type { NextAuthConfig } from "next-auth";

/**
 * Edge-совместимая часть конфигурации Auth.js.
 * Используется в middleware для проверки доступа к защищённым маршрутам.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  // JWT нужен для middleware (Edge не читает сессии из таблицы Session)
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const path = nextUrl.pathname;

      const isProtected =
        path.startsWith("/dashboard") || path.startsWith("/my-notes");

      if (isProtected) {
        return isLoggedIn;
      }

      if (path === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
};
