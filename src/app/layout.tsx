import React from "react";
import type { Metadata } from "next";
import type { Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import WhatsAppFab from "@/components/WhatsAppFab";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  applicationName: "The Bookworm",
  title: "The Bookworm",
  description:
    "Your one-stop shop for digital books. No subscriptions, no shipping — buy once, download instantly, keep forever.",
  keywords: ["books", "ebooks", "digital books", "buy books online"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "The Bookworm",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "The Bookworm",
    description:
      "Your one-stop shop for digital books. Buy once, keep forever.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "The Bookworm Logo",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#E8B930",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <PwaRegister />
        <WhatsAppFab />
        {children}
      </body>
    </html>
  );
}
