/**
 * Standalone connection test — run with:
 *   node scripts/test-connections.mjs
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env.local manually ────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env.local");
const envLines = readFileSync(envPath, "utf-8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  process.env[key] = val;
}

console.log("\n=== THE BOOKWORM — Connection Diagnostics ===\n");
const safeUri = process.env.MONGODB_URI
  ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ":<REDACTED>@")
  : "MISSING";
console.log("  MONGODB_URI        :", safeUri);
console.log("  R2_ACCOUNT_ID      :", process.env.R2_ACCOUNT_ID ?? "MISSING");
console.log("  R2_ACCESS_KEY_ID   :", process.env.R2_ACCESS_KEY_ID ?? "MISSING");
console.log("  R2_SECRET_ACCESS_KEY:", process.env.R2_SECRET_ACCESS_KEY ? "<SET>" : "MISSING");
console.log("  R2_BUCKET_NAME     :", process.env.R2_BUCKET_NAME ?? "MISSING");
console.log("");

// ── 1. MongoDB Atlas ─────────────────────────────────────────────────────────
console.log("── [1/2] Testing MongoDB Atlas connection ──");
try {
  const mongoose = await import("mongoose");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  console.log("  Connecting (timeout: 10s)...");
  await mongoose.default.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  const state = mongoose.default.connection.readyState;
  const dbName = mongoose.default.connection.db?.databaseName;
  console.log("  ✅ MongoDB CONNECTED");
  console.log(`     readyState : ${state} (1 = connected)`);
  console.log(`     database   : ${dbName}`);

  await mongoose.default.disconnect();
} catch (err) {
  console.log("  ❌ MongoDB FAILED:", err.message);
}

console.log("");

// ── 2. Cloudflare R2 ─────────────────────────────────────────────────────────
console.log("── [2/2] Testing Cloudflare R2 connection ──");
try {
  const { S3Client, HeadBucketCommand, ListObjectsV2Command } = await import(
    "@aws-sdk/client-s3"
  );

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("One or more R2 environment variables are missing");
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  console.log(`  Endpoint : ${endpoint}`);
  console.log(`  Bucket   : ${bucket}`);
  console.log("  Sending HeadBucket (timeout: 10s)...");

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    requestHandler: { requestTimeout: 10000, connectionTimeout: 10000 },
  });

  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log("  ✅ R2 HeadBucket SUCCEEDED — bucket is accessible");

  const list = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 })
  );
  console.log(`     Objects in bucket: ${list.KeyCount ?? 0}`);
  (list.Contents ?? []).forEach((o) => console.log(`       - ${o.Key}`));
} catch (err) {
  console.log("  ❌ R2 FAILED:", err.message);
  if (err.Code) console.log("     AWS Error Code:", err.Code);
  if (err.$metadata) console.log("     HTTP Status   :", err.$metadata.httpStatusCode);
}

console.log("\n=== Diagnostics complete ===\n");
