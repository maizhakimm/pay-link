import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bayarlink.my"),

  title: "BayarLink",
  description:
    "Simple shop link for WhatsApp sellers to manage orders and payments. Mudah jual, Mudah bayar.",

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
    icon: [
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/favicon-32x32.png",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "icon",
        url: "/FAVICON-ICON-BAYARLINK.png",
      },
    ],
  },

  openGraph: {
    title: "BayarLink",
    description:
      "Simple shop link for WhatsApp sellers to manage orders and payments. Mudah jual, Mudah bayar.",
    url: "https://www.bayarlink.my",
    siteName: "BayarLink",
    images: [
      {
        url: "/FAVICON-ICON-BAYARLINK.png",
        alt: "BayarLink",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "BayarLink",
    description:
      "Simple shop link for WhatsApp sellers to manage orders and payments. Mudah jual, Mudah bayar.",
    images: ["/FAVICON-ICON-BAYARLINK.png"],
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
