/**
 * importFamous.mjs
 *
 * Imports the most famous, widely-downloaded public domain books from
 * Project Gutenberg, sorted by all-time download count. These are the
 * most recognizable classic titles (Pride & Prejudice, Moby Dick, etc.)
 *
 * Each genre gets its top 10 most popular books.
 *
 * Usage:
 *   node importFamous.mjs
 *   node importFamous.mjs --site http://localhost:3000
 */

import { execSync } from 'child_process';

const SITE = process.argv.includes('--site')
  ? process.argv[process.argv.indexOf('--site') + 1]
  : 'http://localhost:3000';

// Each entry: [search topic for Gutendex, genre tag for our site, count]
// Using sort=popular so we always get the most downloaded / famous books first
const FAMOUS_GENRES = [
  ["fiction",      "Fiction",        10],
  ["adventure",    "Fiction",        10],
  ["mystery",      "Fiction",        10],
  ["science",      "Science",        8],
  ["mathematics",  "Mathematics",    8],
  ["philosophy",   "Nonfiction",     8],
  ["history",      "Nonfiction",     8],
  ["economics",    "Finance",        8],
  ["education",    "Education",      6],
  ["essays",       "Essays",         6],
  ["technology",   "Technology",     6],
  ["law",          "Law",            6],
  ["medicine",     "Medicine & Health", 6],
  ["business",     "Business",       6],
  ["psychology",   "Self-Help",      6],
];

async function main() {
  console.log("📚 Importing most famous books from Project Gutenberg (sorted by popularity)...\n");

  for (const [topic, genre, count] of FAMOUS_GENRES) {
    console.log(`\n── Famous "${genre}" books (topic: ${topic}) ──`);
    try {
      execSync(
        `node importGutendex.mjs --topic "${topic}" --genre "${genre}" --sort popular --count ${count} --site ${SITE}`,
        { stdio: 'inherit' }
      );
    } catch (err) {
      console.error(`  Failed for topic "${topic}":`, err.message);
    }
  }

  console.log("\n✅ Famous books import complete!");
}

main();
