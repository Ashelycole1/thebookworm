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
        return {
          title: `${book.title} | The Bookworm`,
          description: book.description || `Check out ${book.title} on The Bookworm!`,
          openGraph: {
            title: book.title,
            description: book.description || `Check out ${book.title} on The Bookworm!`,
            images: book.coverImageUrl ? [{ url: book.coverImageUrl, width: 800, height: 1200, alt: book.title }] : undefined,
          },
          twitter: {
            card: "summary_large_image",
            title: book.title,
            description: book.description || `Check out ${book.title} on The Bookworm!`,
            images: book.coverImageUrl ? [book.coverImageUrl] : undefined,
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
