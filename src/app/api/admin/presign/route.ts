import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/presign
 *
 * Generates short-lived presigned PUT URLs so the browser can upload
 * the PDF and cover image directly to Cloudflare R2 — bypassing
 * Vercel's 4.5 MB serverless body limit entirely.
 *
 * Body (JSON):
 *   { pdfFilename, pdfContentType, coverFilename, coverContentType }
 *
 * Returns:
 *   { pdfUploadUrl, pdfKey, coverUploadUrl, coverKey }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { pdfFilename, pdfContentType, coverFilename, coverContentType } =
      await req.json();

    if (!pdfFilename || !coverFilename) {
      return NextResponse.json(
        { error: "pdfFilename and coverFilename are required." },
        { status: 400 }
      );
    }

    const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const ts = Date.now();

    const pdfKey = `books/private/${ts}-${sanitize(pdfFilename)}`;
    const coverKey = `books/public/${ts}-${sanitize(coverFilename)}`;

    const client = getR2();
    if (!client) {
      return NextResponse.json({ error: "R2 credentials are not configured on the server." }, { status: 500 });
    }

    const [pdfUploadUrl, coverUploadUrl] = await Promise.all([
      getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: pdfKey,
          ContentType: pdfContentType || "application/pdf",
        }),
        { expiresIn: 600 } // 10 minutes
      ),
      getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: coverKey,
          ContentType: coverContentType || "image/jpeg",
        }),
        { expiresIn: 600 }
      ),
    ]);

    return NextResponse.json({ pdfUploadUrl, pdfKey, coverUploadUrl, coverKey });
  } catch (error) {
    console.error("[presign] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URLs." },
      { status: 500 }
    );
  }
}
