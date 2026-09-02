import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

/**
 * GET /api/admin/books
 * Fetch all books (including hidden ones) for the admin panel.
 */
export async function GET() {
  try {
    await connectDB();
    const books = await Book.find({}).sort({ createdAt: -1 }).lean();
    
    // Normalize genre to always be an array
    const normalized = books.map(book => ({
      ...book,
      genre: Array.isArray(book.genre) ? book.genre : (book.genre ? [book.genre] : ["Fiction"])
    }));
    
    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[Admin] Books GET error:", error);
    return NextResponse.json({ error: "Failed to fetch books." }, { status: 500 });
  }
}

/**
 * POST /api/admin/books
 *
 * Saves book metadata to MongoDB after files have already been uploaded
 * directly to Cloudflare R2 via presigned PUT URLs.
 *
 * Body (JSON):
 *   { title, author, description, priceUGX, genre[], fileStorageKey, coverStorageKey }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { title, author, description, priceUGX, genre, fileStorageKey, coverStorageKey } = body;

    if (!title || !author || !priceUGX || !fileStorageKey || !coverStorageKey) {
      return NextResponse.json(
        { error: "Missing required fields: title, author, priceUGX, fileStorageKey, coverStorageKey." },
        { status: 400 }
      );
    }

    if (isNaN(Number(priceUGX)) || Number(priceUGX) < 0) {
      return NextResponse.json(
        { error: "priceUGX must be a non-negative number." },
        { status: 400 }
      );
    }

    // The cover URL is served through the proxy API route
    const coverImageUrl = `/api/cover?key=${encodeURIComponent(coverStorageKey)}`;

    await connectDB();

    const newBook = await Book.create({
      title,
      author,
      description: description ?? "",
      priceUGX: Number(priceUGX),
      coverImageUrl,
      fileStorageKey,
      genre: Array.isArray(genre) && genre.length > 0 ? genre : ["Fiction"],
    });

    return NextResponse.json(
      { success: true, message: "Book stored successfully.", bookId: newBook._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin] Book creation error:", error);
    return NextResponse.json(
      { error: "Failed to save book metadata." },
      { status: 500 }
    );
  }
}

