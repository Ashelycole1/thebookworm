import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import connectDB from "@/lib/db";
import Book from "@/models/Book";
import { getR2 } from "@/lib/r2";

/**
 * PATCH /api/admin/books/[id]
 * Update a book's metadata. Accepts either JSON (no image) or FormData (with new cover image).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await connectDB();

    const contentType = req.headers.get("content-type") ?? "";
    const update: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      // FormData path: new cover image included
      const formData = await req.formData();
      const allowedText = ["title", "author", "description", "priceUGX"];
      for (const field of allowedText) {
        const val = formData.get(field);
        if (val !== null) {
          update[field] = field === "priceUGX" ? Number(val) : val;
        }
      }

      // genres
      const genres = formData.getAll("genre");
      if (genres.length > 0) {
        update.genre = genres.map(String);
      }

      // cover image upload to R2
      const coverFile = formData.get("coverImage") as File | null;
      if (coverFile && coverFile.size > 0) {
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
        const sanitized = coverFile.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
        const coverKey = `books/public/${Date.now()}-${sanitized}`;

        const client = getR2();
        if (!client) {
          return NextResponse.json({ error: "R2 credentials are not configured on the server." }, { status: 500 });
        }

        await client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: coverKey,
          Body: coverBuffer,
          ContentType: coverFile.type || "image/jpeg",
        }));

        update.coverImageUrl = `/api/cover?key=${encodeURIComponent(coverKey)}`;
      }
    } else {
      // JSON path: text fields only
      const body = await req.json();
      const allowedFields = ["title", "author", "description", "priceUGX", "genre", "isAvailable", "featured"];
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          update[field] = body[field];
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const book = await Book.findByIdAndUpdate(id, update, { new: true });
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, book });
  } catch (error) {
    console.error("[Admin] Book PATCH error:", error);
    return NextResponse.json({ error: "Failed to update book." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/books/[id]
 * Remove a book record from MongoDB.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await connectDB();
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin] Book DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete book." }, { status: 500 });
  }
}
