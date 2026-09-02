import type { Metadata, ResolvingMetadata } from "next";
import HomeClient from "./HomeClient";
import connectDB from "@/lib/db";
import BookModel from "@/models/Book";
import type { Book, Genre } from "@/types";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const UGX_RATE = 300;

/** Shared helper — fetch & map books from DB */
async function fetchBooks(): Promise<Book[]> {
  await connectDB();
  const dbBooks = await BookModel.find({ isAvailable: { $ne: false } }).sort({ createdAt: -1 }).lean();
  return dbBooks.map((book) => ({
    id: (book._id as { toString(): string }).toString(),
    title: book.title,
    author: book.author,
    genre: (Array.isArray(book.genre) ? book.genre : (book.genre ? [book.genre] : ["Fiction"])) as Genre[],
    price: Math.round(book.priceUGX / UGX_RATE),
    rating: 5.0,
    blurb: book.description,
    formats: ["PDF"] as ["PDF"],
    coverImageUrl: book.coverImageUrl,
  }));
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const bookId = resolvedSearchParams?.book;

  if (typeof bookId === "string") {
    try {
      await connectDB();
      const book = await BookModel.findById(bookId).lean();

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

export default async function HomePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const initialBookId = typeof resolvedSearchParams?.book === "string"
    ? resolvedSearchParams.book
    : undefined;

  let initialBooks: Book[] = [];
  try {
    initialBooks = await fetchBooks();
  } catch (e) {
    console.error("Failed to fetch books for SSR:", e);
  }

  return <HomeClient initialBooks={initialBooks} initialBookId={initialBookId} />;
}

