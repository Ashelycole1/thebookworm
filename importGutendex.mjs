/**
 * scripts/importGutendex.mjs
 *
 * Pulls public-domain books from Gutendex (Project Gutenberg's free API)
 * and imports them into The Bookworm using the CURRENT upload flow:
 *
 *   1. Fetch book metadata + files from Gutendex
 *   2. Ask /api/admin/presign for presigned R2 PUT URLs
 *   3. PUT the cover + book file directly to R2
 *   4. POST metadata + storage keys to /api/admin/books
 *
 * Usage:
 *   node scripts/importGutendex.mjs --topic fiction --count 15
 *   node scripts/importGutendex.mjs --topic "science fiction" --count 10 --site http://localhost:3000
 *
 * IMPORTANT: /api/admin/books and /api/admin/presign currently have no
 * auth check. Add one before running this against production, and pass
 * an --adminKey / header here once you do.
 */

const getArg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : fallback;
};

const TOPIC = getArg("topic", "");
const SORT = getArg("sort", "");          // e.g. --sort popular
const GENRE = getArg("genre", TOPIC);    // override genre tag, defaults to TOPIC
const COUNT = parseInt(getArg("count", "15"), 10);
const SITE = getArg("site", "http://localhost:3000");
const USD_TO_UGX = parseInt(getArg("rate", "3700"), 10);
const FLAT_PRICE_UGX = getArg("price", null);

async function fetchGutendexBooks(topic, count) {
  const results = [];
  const params = new URLSearchParams({ languages: "en" });
  if (topic) params.set("topic", topic);
  if (SORT)  params.set("sort", SORT);
  let url = `https://gutendex.com/books/?${params}`;
  while (url && results.length < count) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gutendex error: ${res.status}`);
    const data = await res.json();
    for (const b of data.results) {
      const fileUrl = b.formats?.["application/pdf"] || b.formats?.["application/epub+zip"];
      const coverUrl = b.formats?.["image/jpeg"];
      if (fileUrl && coverUrl) results.push({ ...b, _fileUrl: fileUrl, _coverUrl: coverUrl });
      if (results.length >= count) break;
    }
    url = data.next;
  }
  return results;
}

function formatAuthor(name) {
  if (!name) return "Unknown";
  return name.includes(",")
    ? name.split(",").reverse().map((s) => s.trim()).join(" ")
    : name;
}

function priceForBook() {
  if (FLAT_PRICE_UGX) return Number(FLAT_PRICE_UGX);
  // Random price between 2000 and 3000
  return Math.floor(Math.random() * 1001) + 2000;
}

async function getPresignedUrls(pdfFilename, pdfContentType, coverFilename, coverContentType) {
  const res = await fetch(`${SITE}/api/admin/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfFilename, pdfContentType, coverFilename, coverContentType }),
  });
  if (!res.ok) throw new Error(`Presign failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function putToR2(uploadUrl, bytes, contentType) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: bytes,
  });
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`);
}

async function createBookRecord(payload) {
  const res = await fetch(`${SITE}/api/admin/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Book creation failed: ${res.status}`);
  return json;
}

async function importOne(gb) {
  const title = gb.title;
  const author = formatAuthor(gb.authors?.[0]?.name);
  console.log(`→ ${title} (${author})`);

  // Download the actual files from Gutendex's hosts
  const [fileRes, coverRes] = await Promise.all([fetch(gb._fileUrl), fetch(gb._coverUrl)]);
  if (!fileRes.ok || !coverRes.ok) throw new Error("Failed to download source files");

  const fileBytes = Buffer.from(await fileRes.arrayBuffer());
  const coverBytes = Buffer.from(await coverRes.arrayBuffer());

  const fileIsPdf = gb._fileUrl.endsWith(".pdf");
  const fileContentType = fileIsPdf ? "application/pdf" : "application/epub+zip";
  const fileExt = fileIsPdf ? "pdf" : "epub";

  const pdfFilename = `${title}.${fileExt}`;
  const coverFilename = `${title}-cover.jpg`;

  // 1. Get presigned R2 URLs
  const { pdfUploadUrl, pdfKey, coverUploadUrl, coverKey } = await getPresignedUrls(
    pdfFilename,
    fileContentType,
    coverFilename,
    "image/jpeg"
  );

  // 2. Upload directly to R2
  await Promise.all([
    putToR2(pdfUploadUrl, fileBytes, fileContentType),
    putToR2(coverUploadUrl, coverBytes, "image/jpeg"),
  ]);

  // 3. Save metadata to MongoDB
  // Always use GENRE (defaults to TOPIC) so it matches the site's genre filter tabs.
  // The --genre flag lets importFamous.mjs override this per-run.
  const genre = GENRE || "Other";
  const result = await createBookRecord({
    title,
    author,
    description: `A public domain classic${author !== "Unknown" ? " by " + author : ""}, sourced via Project Gutenberg.`,
    priceUGX: priceForBook(),
    genre: [genre],
    fileStorageKey: pdfKey,
    coverStorageKey: coverKey,
  });

  console.log(`  ✓ saved (id: ${result.bookId})`);
}

async function main() {
  console.log(`Fetching up to ${COUNT} "${TOPIC}" books from Gutendex...`);
  const books = await fetchGutendexBooks(TOPIC, COUNT);
  console.log(`Found ${books.length} usable books. Importing to ${SITE}...\n`);

  let ok = 0, fail = 0;
  for (const gb of books) {
    try {
      await importOne(gb);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${gb.title}: ${err.message}`);
      fail++;
    }
    await new Promise((r) => setTimeout(r, 500)); // be polite to Gutendex + your own API
  }

  console.log(`\nDone. ${ok} imported, ${fail} failed.`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
