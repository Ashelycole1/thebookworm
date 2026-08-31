import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Bookworm — Hand-picked Digital Books",
  description:
    "Browse and buy twelve hand-picked digital books. No subscriptions, no shipping — buy once, download instantly, keep forever.",
  keywords: ["books", "ebooks", "digital books", "buy books online"],
  openGraph: {
    title: "The Bookworm",
    description:
      "Twelve hand-picked digital books. Buy once, keep forever.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
