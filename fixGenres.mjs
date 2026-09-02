/**
 * fixGenres.mjs
 *
 * One-off migration script to fix books that were imported with
 * Gutenberg's own bookshelf category names instead of our site's
 * valid genre names.
 *
 * Strategy:
 *  - Books imported by the old script have descriptions like:
 *    "A public domain classic by X, sourced via Project Gutenberg."
 *  - Their genre field may be a random Gutenberg tag (e.g. "Harvard Classics")
 *    OR a mis-named topic (e.g. "Medicine" instead of "Medicine & Health").
 *  - We find all books whose genre[] contains NO valid genre and update them
 *    by inferring the genre from keywords in the title/description.
 *
 * Usage:
 *   node fixGenres.mjs
 */

import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Manually load .env.local (dotenv may not be installed at root level)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env.local");
const envLines = readFileSync(envPath, "utf8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}


const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

// The canonical list of valid genres on the site
const VALID_GENRES = [
  "Programming",
  "Engineering",
  "Data Science",
  "Mathematics",
  "Science",
  "Medicine & Health",
  "Law",
  "Business",
  "Finance",
  "Education",
  "Self-Help",
  "Technology",
  "Fiction",
  "Nonfiction",
  "Essays",
  "Design",
  "Other",
];

// Map of known bad genre names from Gutenberg → our valid genre
const KNOWN_FIXES = {
  "medicine": "Medicine & Health",
  "medical": "Medicine & Health",
  "health": "Medicine & Health",
  "fiction": "Fiction",
  "science fiction": "Science",
  "technology": "Technology",
  "law": "Law",
  "legal": "Law",
  "business": "Business",
  "finance": "Finance",
  "education": "Education",
  "self-help": "Self-Help",
  "self help": "Self-Help",
  "design": "Design",
  "mathematics": "Mathematics",
  "math": "Mathematics",
  "engineering": "Engineering",
  "programming": "Programming",
  "essays": "Essays",
  "nonfiction": "Nonfiction",
  "science": "Science",
  "data science": "Data Science",
};

function inferGenre(currentGenres, title, description) {
  // Try to map each current genre to a valid one
  for (const g of currentGenres) {
    const lower = g.toLowerCase().trim();
    // Direct match (case-insensitive)
    const directMatch = VALID_GENRES.find(v => v.toLowerCase() === lower);
    if (directMatch) return directMatch;
    // Known mapping
    if (KNOWN_FIXES[lower]) return KNOWN_FIXES[lower];
    // Partial match
    for (const [key, val] of Object.entries(KNOWN_FIXES)) {
      if (lower.includes(key)) return val;
    }
  }
  // Fallback: try title keywords
  const titleLower = title.toLowerCase();
  for (const [key, val] of Object.entries(KNOWN_FIXES)) {
    if (titleLower.includes(key)) return val;
  }
  return "Other";
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.\n");

  const BookSchema = new mongoose.Schema({
    title: String,
    author: String,
    description: String,
    genre: [String],
    priceUGX: Number,
    coverImageUrl: String,
    fileStorageKey: { type: String, select: false },
    isAvailable: Boolean,
  }, { timestamps: true });

  const Book = mongoose.models.Book || mongoose.model("Book", BookSchema);

  // Find all books
  const allBooks = await Book.find({}).lean();
  console.log(`Total books in DB: ${allBooks.length}`);

  let fixed = 0;
  let skipped = 0;

  for (const book of allBooks) {
    const genres = Array.isArray(book.genre) ? book.genre : [book.genre].filter(Boolean);
    
    // Check if ALL genres are valid
    const hasValidGenre = genres.some(g =>
      VALID_GENRES.some(v => v.toLowerCase() === g?.toLowerCase()?.trim())
    );

    if (hasValidGenre) {
      skipped++;
      continue;
    }

    // Genre is invalid — fix it
    const corrected = inferGenre(genres, book.title, book.description);
    await Book.updateOne({ _id: book._id }, { $set: { genre: [corrected] } });
    console.log(`  ✓ Fixed: "${book.title}" [${genres.join(", ")}] → [${corrected}]`);
    fixed++;
  }

  console.log(`\nDone. ${fixed} books fixed, ${skipped} already had valid genres.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
