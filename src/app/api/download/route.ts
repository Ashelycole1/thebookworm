import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import connectDB from "@/lib/db";
import Book from "@/models/Book";
import Order from "@/models/Order";
import { getR2 } from "@/lib/r2";

/** Duration in seconds the presigned URL stays valid (15 minutes) */
const PRESIGNED_URL_TTL_SECONDS = 900;

/**
 * POST /api/download
 *
 * Secure endpoint to issue a time-limited (15-minute) presigned download
 * URL for a purchased digital book asset stored on Cloudflare R2.
 *
 * Request body (JSON):
 *   - transactionId  (string, required) — payment/order reference
 *   - bookId         (string, required) — MongoDB ObjectId of the book
 *
 * Workflow:
 *   1. Validate request parameters
 *   2. Verify payment/transaction status against Order collection (TODO)
 *   3. Fetch the book record including its hidden `fileStorageKey`
 *   4. Generate and return a 15-minute presigned R2 URL
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { transactionId, bookId } = body as {
      transactionId?: string;
      bookId?: string;
    };

    if (!transactionId || !bookId) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: transactionId and bookId.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // -----------------------------------------------------------------------
    // 1. PAYMENT VERIFICATION STEP
    // -----------------------------------------------------------------------
    const order = await Order.findOne({
      transactionId,
      books: bookId,
      status: "SUCCESSFUL",
    });

    if (!order) {
      return NextResponse.json(
        { error: "Payment verification failed or book not in order. Download forbidden." },
        { status: 403 }
      );
    }

    // 2. Fetch the target book, explicitly including the hidden fileStorageKey
    const book = await Book.findById(bookId).select("+fileStorageKey");

    if (!book) {
      return NextResponse.json(
        { error: "Book not found." },
        { status: 404 }
      );
    }

    if (!book.fileStorageKey) {
      return NextResponse.json(
        { error: "Book digital asset key not found." },
        { status: 404 }
      );
    }

    if (!book.isAvailable) {
      return NextResponse.json(
        { error: "This book is currently unavailable for download." },
        { status: 403 }
      );
    }

    // 3. Generate a temporary presigned URL valid for 15 minutes
    const sanitizedTitle = book.title.replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: book.fileStorageKey,
      ResponseContentDisposition: `attachment; filename="${sanitizedTitle}.pdf"`,
    });
    const client = getR2();
    if (!client) {
      return NextResponse.json({ error: "R2 credentials are not configured on the server." }, { status: 500 });
    }

    const downloadUrl = await getSignedUrl(client, command, {
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });

    return NextResponse.json(
      {
        success: true,
        downloadUrl,
        expiresInSeconds: PRESIGNED_URL_TTL_SECONDS,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Download] Presigned URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to issue download access token." },
      { status: 500 }
    );
  }
}
