import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2 } from "@/lib/r2";
import connectDB from "@/lib/db";
import Book from "@/models/Book";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const title = form.get("title")?.toString() || "";
    const author = form.get("author")?.toString() || "";
    const description = form.get("description")?.toString() || "";
    const priceUGX = Number(form.get("priceUGX")?.toString() || "0");
    const genres = form.getAll("genre").map(g => g.toString());

    const coverFile = form.get("coverImage") as any;
    const pdfFile = form.get("file") as any;

    if (!title || !author || !priceUGX || !coverFile || !pdfFile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const ts = Date.now();
    const pdfKey = `books/private/${ts}-${sanitize(pdfFile.name || "file.pdf")}`;
    const coverKey = `books/public/${ts}-${sanitize(coverFile.name || "cover.jpg")}`;

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

    const client = getR2();
    if (!client) {
      return NextResponse.json({ error: "R2 credentials are not configured on the server." }, { status: 500 });
    }

    // Upload files to R2 via server
    await client.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: pdfKey, Body: pdfBuffer, ContentType: pdfFile.type || "application/pdf" }));
    await client.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: coverKey, Body: coverBuffer, ContentType: coverFile.type || "image/jpeg" }));

    const coverImageUrl = `/api/cover?key=${encodeURIComponent(coverKey)}`;

    await connectDB();
    const newBook = await Book.create({
      title,
      author,
      description: description ?? "",
      priceUGX,
      coverImageUrl,
      fileStorageKey: pdfKey,
      genre: Array.isArray(genres) && genres.length > 0 ? genres : ["Fiction"],
    });

    return NextResponse.json({ success: true, bookId: newBook._id }, { status: 201 });
  } catch (err) {
    console.error("[upload-proxy] error", err);
    return NextResponse.json({ error: "Upload proxy failed" }, { status: 500 });
  }
}
