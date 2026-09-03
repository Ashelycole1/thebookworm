import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

export const dynamic = "force-dynamic";

/**
 * GET /api/og-image?id=<bookId>
 *
 * Proxies a book's cover image directly from R2 storage so social crawlers
 * (WhatsApp, Twitter, Slack, etc.) can fetch the Open Graph image reliably.
 * Unlike /api/cover which redirects to a presigned URL, this route streams
 * the raw image bytes — no redirect chain, no auth required by the crawler.
 */
export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get("id");

  if (!bookId) {
    return NextResponse.json({ error: "Missing id param" }, { status: 400 });
  }

  try {
    await connectDB();
    const book = await Book.findById(bookId).lean();

    if (!book || !book.coverImageUrl) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // coverImageUrl is stored as either:
    // - /api/cover?key=books%2Fpublic%2F<key>
    // - /books/public/<key>
    // - a fully-qualified URL
    const coverUrl = book.coverImageUrl as string;
    let r2Key = coverUrl;

    if (coverUrl.startsWith("/api/cover?key=")) {
      const keyParam = new URL(coverUrl, "https://example.com").searchParams.get("key");
      if (keyParam) {
        r2Key = decodeURIComponent(keyParam);
      }
    } else if (r2Key.startsWith("/books/public/")) {
      r2Key = r2Key.slice("/books/public/".length);
    }

    // Handle: already a full URL (e.g. https://...) — redirect directly
    if (r2Key.startsWith("http://") || r2Key.startsWith("https://")) {
      return NextResponse.redirect(r2Key);
    }

    if (!r2Key || r2Key === "/api/cover") {
      return NextResponse.json({ error: "No valid cover image key" }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: r2Key,
    });

    const response = await r2.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "No image body" }, { status: 500 });
    }

    // Stream the body as a Uint8Array
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const contentType = response.ContentType ?? "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache for 1 day at the CDN/crawler level
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[og-image] Failed to proxy cover:", error);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}
