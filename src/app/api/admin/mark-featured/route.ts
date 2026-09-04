import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

export const dynamic = "force-dynamic";

// Temporary admin helper: marks books with 'freekids' in their cover URL as featured.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const res = await Book.updateMany({ coverImageUrl: /freekids/i }, { $set: { featured: true, isAvailable: true } });
    return NextResponse.json({ matched: res.matchedCount, modified: res.modifiedCount });
  } catch (error) {
    console.error('[Admin] mark-featured error', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
