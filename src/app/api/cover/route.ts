import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";

/**
 * GET /api/cover?key=books/public/...
 *
 * Generates a short-lived presigned URL for a cover image in R2 and redirects to it.
 * This allows private/public R2 buckets to serve images to the browser securely.
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key param" }, { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    // Presigned URL valid for 1 hour
    const url = await getSignedUrl(r2, command, { expiresIn: 3600 });

    // Redirect the browser to the presigned URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[Cover] Failed to generate presigned URL:", error);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}
