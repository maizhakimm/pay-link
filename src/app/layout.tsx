import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bayarlink.my"),
  title: "BayarLink",
  description: "Simple shop link for WhatsApp sellers to manage orders and payments. Mudah jual, Mudah bayar.",
  applicationName: "BayarLink",
  keywords: [
    "BayarLink",
    "WhatsApp seller",
    "shop link",
    "order management",
    "payment link",
    "home-based seller",
    "food seller",
  ],
  icons: {
    icon: "/BayarLink-Logo-01.svg",
    shortcut: "/BayarLink-Logo-01.svg",
    apple: "/BayarLink-Logo-01.svg",
  },
  openGraph: {
    title: "BayarLink",
    description: "Simple shop link for WhatsApp sellers to manage orders and payments. Mudah jual, Mudah bayar.",
    url: "https://www.bayarlink.my",
    siteName: "BayarLink",
    images: [
      {
        url: "/BayarLink-Logo-01.svg",
        alt: "BayarLink",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BayarLink",
    description: "Simple shop link for WhatsApp sellers to manage orders and payments. Mudah jual, Mudah bayar.",
    images: ["/BayarLink-Logo-01.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
