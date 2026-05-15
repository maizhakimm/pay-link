import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEUGENS | AI-Enabled Systems & Digital Solutions",
  description:
    "NEUGENS helps businesses build intelligent digital systems, automation workflows, apps, dashboards, and modern business platforms powered by AI-enhanced development.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
