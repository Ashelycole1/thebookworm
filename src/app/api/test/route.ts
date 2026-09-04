import { NextResponse } from "next/server";
import { HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import connectDB from "@/lib/db";
import { getR2 } from "@/lib/r2";
import Book from "@/models/Book";

/**
 * GET /api/test
 *
 * System health-check endpoint. Tests:
 *  1. MongoDB Atlas — connect + ping the books collection
 *  2. Cloudflare R2  — HeadBucket to verify credentials & bucket access
 *  3. Book model      — count documents to confirm schema is wired correctly
 *
 * ⚠️  REMOVE OR PROTECT THIS ROUTE BEFORE GOING TO PRODUCTION.
 */
export async function GET() {
  const results: Record<string, unknown> = {};

  // ── 1. MongoDB Atlas ──────────────────────────────────────────────────────
  try {
    const mongoose = await connectDB();
    const state = mongoose.connection.readyState;
    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const stateLabel = ["disconnected", "connected", "connecting", "disconnecting"][state] ?? "unknown";

    const bookCount = await Book.countDocuments();

    results.mongodb = {
      status: "ok",
      readyState: stateLabel,
      database: mongoose.connection.db?.databaseName ?? "unknown",
      booksInCollection: bookCount,
    };
  } catch (err) {
    results.mongodb = {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  // ── 2. Cloudflare R2 ─────────────────────────────────────────────────────
  const bucket = process.env.R2_BUCKET_NAME ?? "(R2_BUCKET_NAME not set)";
  try {
    const client = getR2();
    if (!client) throw new Error("R2 credentials not configured");
    // HeadBucket confirms the bucket exists and credentials are valid
    await client.send(new HeadBucketCommand({ Bucket: bucket }));

    // List up to 5 objects to show the bucket is accessible
    const list = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 })
    );

    results.r2 = {
      status: "ok",
      bucket,
      objectCount: list.KeyCount ?? 0,
      sampleKeys: (list.Contents ?? []).map((o) => o.Key),
    };
  } catch (err) {
    results.r2 = {
      status: "error",
      bucket,
      message: err instanceof Error ? err.message : String(err),
    };
  }

  // ── Overall health ────────────────────────────────────────────────────────
  const allOk = Object.values(results).every(
    (r) => (r as { status: string }).status === "ok"
  );

  return NextResponse.json(
    {
      overall: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: results,
    },
    { status: allOk ? 200 : 500 }
  );
}
