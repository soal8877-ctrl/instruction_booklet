import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instruction Booklet",
  description: "Минимальное приложение Next.js + Prisma + Neon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
