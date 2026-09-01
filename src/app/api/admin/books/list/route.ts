import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

/**
 * GET /api/admin/books
 * Returns all books (including unavailable ones) for admin management.
 */
export async function GET() {
  try {
    await connectDB();
    const books = await Book.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(books);
  } catch (error) {
    console.error("[Admin] Books GET error:", error);
    return NextResponse.json({ error: "Failed to fetch books." }, { status: 500 });
  }
}
