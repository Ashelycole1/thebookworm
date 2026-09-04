import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

/**
 * POST /api/admin/books/restore
 * Emergency endpoint: sets isAvailable=true on ALL books.
 * Use this when books have been accidentally hidden.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const result = await Book.updateMany({}, { isAvailable: true });
    return NextResponse.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error("[Admin] Restore error:", error);
    return NextResponse.json({ error: "Failed to restore books." }, { status: 500 });
  }
}
