import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import connectDB from "@/lib/db";
import Book from "@/models/Book";
import { getR2 } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await connectDB();
    const book = await Book.findById(id).select("+fileStorageKey");
    
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    if (!book.fileStorageKey) {
      return NextResponse.json({ error: "File key not found" }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: book.fileStorageKey,
    });

    const client = getR2();
    if (!client) return NextResponse.json({ error: "R2 credentials are not configured on the server." }, { status: 500 });

    // Generate a presigned URL valid for 24 hours so admin can send it easily
    const url = await getSignedUrl(client, command, { expiresIn: 86400 });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Admin download link error:", error);
    return NextResponse.json(
      { error: "Failed to generate link" },
      { status: 500 }
    );
  }
}
