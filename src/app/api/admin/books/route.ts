import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import connectDB from "@/lib/db";
import Book from "@/models/Book";
import { r2 } from "@/lib/r2";

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
 * Admin endpoint to register a new digital book product.
 * Accepts multipart/form-data with the following fields:
 *   - title        (string, required)
 *   - author       (string, required)
 *   - description  (string, optional)
 *   - priceUGX     (number, required)
 *   - coverImage   (binary image file, required)
 *   - file         (binary PDF/EPUB file, required)
 *
 * Workflow:
 *   1. Upload the digital file to Cloudflare R2 under a private path
 *   2. Upload the cover image to Cloudflare R2 under a public path
 *   3. Store book metadata + R2 storage keys in MongoDB Atlas
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const title = formData.get("title") as string | null;
    const author = formData.get("author") as string | null;
    const description = (formData.get("description") as string | null) ?? "";
    const priceUGX = Number(formData.get("priceUGX"));
    const coverImageFile = formData.get("coverImage") as File | null;
    const pdfFile = formData.get("file") as File | null;
    
    let genres: string[] = ["Fiction"];
    const genreData = formData.getAll("genre");
    if (genreData.length > 0) {
      genres = genreData.map((g) => g.toString());
    }

    // Validate required fields
    if (!title || !author || !priceUGX || !coverImageFile || !pdfFile) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, author, priceUGX, coverImage, and PDF file are mandatory.",
        },
        { status: 400 }
      );
    }

    if (isNaN(priceUGX) || priceUGX < 0) {
      return NextResponse.json(
        { error: "priceUGX must be a non-negative number." },
        { status: 400 }
      );
    }

    // 1. Prepare PDF binary stream for Cloudflare R2 upload
    const pdfArrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    const sanitizedPdfFilename = pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileStorageKey = `books/private/${Date.now()}-${sanitizedPdfFilename}`;

    // 2. Prepare Cover Image stream for Cloudflare R2 upload
    const coverArrayBuffer = await coverImageFile.arrayBuffer();
    const coverBuffer = Buffer.from(coverArrayBuffer);
    const sanitizedCoverFilename = coverImageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const coverStorageKey = `books/public/${Date.now()}-${sanitizedCoverFilename}`;

    // 3. Upload both files to Cloudflare R2
    const uploadPdfCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileStorageKey,
      Body: pdfBuffer,
      ContentType: pdfFile.type || "application/pdf",
    });

    const uploadCoverCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: coverStorageKey,
      Body: coverBuffer,
      ContentType: coverImageFile.type || "image/jpeg",
    });

    await Promise.all([
      r2.send(uploadPdfCommand),
      r2.send(uploadCoverCommand)
    ]);

    // The public URL for the cover image proxied through our API route
    const coverImageUrl = `/api/cover?key=${encodeURIComponent(coverStorageKey)}`;

    // 4. Save book metadata to MongoDB Atlas
    await connectDB();

    const newBook = await Book.create({
      title,
      author,
      description,
      priceUGX,
      coverImageUrl,
      fileStorageKey,
      genre: genres,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Book and digital asset stored successfully.",
        bookId: newBook._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin] Book creation error:", error);
    return NextResponse.json(
      { error: "Failed to process book upload and metadata creation." },
      { status: 500 }
    );
  }
}
