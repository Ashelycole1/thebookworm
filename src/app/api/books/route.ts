import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Book from "@/models/Book";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Fetch available books from the database
    // Using { $ne: false } so that older documents without the field default to being available
    // Note: fileStorageKey is excluded by default in the schema (select: false)
    const dbBooks = await Book.find({ isAvailable: { $ne: false } }).sort({ createdAt: -1 });

    // Map the database document to the format expected by the frontend Book interface.
    // The internal `price` field is a USD-equivalent: priceUGX / 300 (the UGX rate in currency.ts).
    // This lets formatPrice() correctly display in any currency (UGX, USD, KES, etc.)
    const UGX_RATE = 300;
    const books = dbBooks.map((book) => ({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      genre: Array.isArray(book.genre) ? book.genre : (book.genre ? [book.genre] : ["Fiction"]),
      price: Math.round(book.priceUGX / UGX_RATE),
      rating: 5.0,
      blurb: book.description,
      formats: ["PDF"],
      coverImageUrl: book.coverImageUrl,
    }));

    return NextResponse.json(books);
  } catch (error) {
    console.error("[API Books GET] Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books." },
      { status: 500 }
    );
  }
}
