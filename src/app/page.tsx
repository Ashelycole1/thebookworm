import type { Metadata, ResolvingMetadata } from "next";
import HomeClient from "./HomeClient";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const bookId = resolvedSearchParams?.book;

  if (typeof bookId === "string") {
    try {
      await connectDB();
      const book = await Book.findById(bookId).lean();

      if (book) {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        // Use the proxy endpoint so crawlers get image bytes directly (no redirect chain)
        const ogImageUrl = `${siteUrl}/api/og-image?id=${bookId}`;
        const description =
          (book.description as string) ||
          `Check out ${book.title} on The Bookworm!`;

        return {
          title: `${book.title} | The Bookworm`,
          description,
          openGraph: {
            title: book.title as string,
            description,
            images: [{ url: ogImageUrl, width: 800, height: 1200, alt: book.title as string }],
          },
          twitter: {
            card: "summary_large_image",
            title: book.title as string,
            description,
            images: [ogImageUrl],
          },
        };
      }
    } catch (error) {
      console.error("Failed to generate metadata for book:", error);
    }
  }

  // Fallback to default
  return {};
}


export default function HomePage() {
  return <HomeClient />;
}
