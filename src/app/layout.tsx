import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pay Link",
  description: "Minimal Next.js App Router starter"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
