/**
 * importOpenStax.mjs
 *
 * Imports OpenStax university-level open textbooks into The Bookworm.
 * All books are freely & legally available under Creative Commons licenses.
 * Source: https://openstax.org
 *
 * Fetches the live book catalog from the OpenStax CMS API, which includes
 * the real PDF download URLs and cover image URLs for every book.
 *
 * Usage:
 *   node importOpenStax.mjs
 *   node importOpenStax.mjs --site http://localhost:3000
 */

const getArg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : fallback;
};

const SITE = getArg("site", "http://localhost:3000");

// Map OpenStax subject names → our site genre tabs
const SUBJECT_TO_GENRE = {
  "Math":                      "Mathematics",
  "Science":                   "Science",
  "Physics":                   "Science",
  "Biology":                   "Science",
  "Chemistry":                 "Science",
  "Astronomy":                 "Science",
  "Statistics":                "Mathematics",
  "Calculus":                  "Mathematics",
  "Algebra":                   "Mathematics",
  "Business":                  "Business",
  "Economics":                 "Finance",
  "Accounting":                "Business",
  "Finance":                   "Finance",
  "Management":                "Business",
  "Entrepreneurship":          "Business",
  "Humanities":                "Nonfiction",
  "History":                   "Nonfiction",
  "Social Sciences":           "Education",
  "Psychology":                "Education",
  "Sociology":                 "Education",
  "Education":                 "Education",
  "Computer Science":          "Programming",
  "Technology":                "Technology",
  "Engineering":               "Engineering",
  "Health":                    "Medicine & Health",
  "Nursing":                   "Medicine & Health",
  "Medicine":                  "Medicine & Health",
  "Anatomy":                   "Medicine & Health",
  "Law":                       "Law",
};

function mapGenre(book) {
  // OpenStax API stores subjects as plain strings in book_subjects[]
  // subjects[] and subject_categories[] are always empty from the API
  const subjectList = [
    ...(book.book_subjects ?? []),
    ...(book.subjects ?? []),
    ...(book.subject_categories ?? []),
  ].map(s => (typeof s === "string" ? s : s?.subject_name ?? "").toLowerCase());

  const titleLower = (book.title ?? "").toLowerCase();

  const checks = [...subjectList, titleLower];

  for (const text of checks) {
    if (/calculus|algebra|trigonometry|pre-?calc|geometry|statistics|arithmetic|math/i.test(text)) return "Mathematics";
    if (/physics|biology|chemistry|astronomy|ecology|genetics|earth science|environ/i.test(text)) return "Science";
    if (/anatomy|physiology|microbiology|nursing|health|medicine|pharmacology/i.test(text)) return "Medicine & Health";
    if (/economics|macro|micro|econom/i.test(text)) return "Finance";
    if (/account|business|management|entrepreneur|marketing|organiz|leadership/i.test(text)) return "Business";
    if (/psychology|sociology|social science|anthropolog/i.test(text)) return "Education";
    if (/history|american government|political|civics|world history/i.test(text)) return "Nonfiction";
    if (/computer science|programming|python|java|data structure/i.test(text)) return "Programming";
    if (/engineering|manufacturing|mechanical|electrical/i.test(text)) return "Engineering";
    if (/writing|english|composition|literature|humanities/i.test(text)) return "Education";
    if (/law|legal|constitutional/i.test(text)) return "Law";
    if (/statistics|probability/i.test(text)) return "Mathematics";
  }

  return "Nonfiction";
}

function priceForBook() {
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

async function fetchCatalog() {
  console.log("Fetching OpenStax book catalog...");
  const res = await fetch("https://openstax.org/apps/cms/api/books/?format=json", {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Bookworm-Importer/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Failed to fetch catalog: ${res.status}`);
  const data = await res.json();
  // The API returns { books: [...] } with nested book objects
  const raw = data?.books ?? data;
  return Array.isArray(raw) ? raw : Object.values(raw).flat().filter(b => typeof b === "object" && b.slug);
}

async function importOne(book, genre) {
  const title  = book.title;
  const pdfUrl = book.pdf_url || book.high_resolution_pdf_url;
  let coverUrl = book.cover_url;

  if (!pdfUrl) throw new Error("No PDF URL available");

  // Cover: OpenStax covers are SVGs — convert to a small JPEG via placehold for upload
  // We store the cover in R2 as a JPEG placeholder; the actual SVG is linked in description
  const slug = (book.slug ?? "").replace("books/", "");
  const coverFilename = `openstax-${slug}-cover.jpg`;
  const pdfFilename   = `openstax-${slug}.pdf`;

  // Download PDF (can be large — allow 60s)
  console.log(`  Downloading PDF...`);
  const pdfRes = await fetch(pdfUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Bookworm-Importer/1.0)" },
    signal: AbortSignal.timeout(60000),
  });
  if (!pdfRes.ok) throw new Error(`PDF download failed (${pdfRes.status}): ${pdfUrl}`);
  const pdfBytes = Buffer.from(await pdfRes.arrayBuffer());

  // For the cover: try to get a JPEG. If the cover is an SVG, use a colored placeholder.
  let coverBytes;
  let coverContentType = "image/jpeg";
  if (coverUrl && !coverUrl.endsWith(".svg")) {
    const covRes = await fetch(coverUrl, { signal: AbortSignal.timeout(10000) });
    if (covRes.ok) {
      coverBytes = Buffer.from(await covRes.arrayBuffer());
      coverContentType = covRes.headers.get("content-type") ?? "image/jpeg";
    }
  }
  // Fallback: use a genre-colored placeholder JPEG
  if (!coverBytes) {
    const colors = {
      "Mathematics":       "2E3F70/EEF2FF",
      "Science":           "5F8B72/F2FFF8",
      "Medicine & Health": "B85C6B/FFF1F3",
      "Business":          "8C5B4A/FFF1EA",
      "Finance":           "2C2C29/F7F6F1",
      "Education":         "E8B930/241C05",
      "Nonfiction":        "4A6741/F0FFF0",
      "Technology":        "3B4A6B/E8EEFF",
      "Programming":       "1A1A2E/E0E0FF",
      "Engineering":       "5B3A29/FFF0E8",
    }[genre] ?? "2E3F70/EEF2FF";
    const fallbackUrl = `https://placehold.co/400x600/${colors}.jpg`;
    const covRes = await fetch(fallbackUrl, { signal: AbortSignal.timeout(10000) });
    if (!covRes.ok) throw new Error("Placeholder cover also failed");
    coverBytes = Buffer.from(await covRes.arrayBuffer());
  }

  // Get presigned R2 URLs
  const { pdfUploadUrl, pdfKey, coverUploadUrl, coverKey } = await getPresignedUrls(
    pdfFilename, "application/pdf",
    coverFilename, coverContentType
  );

  // Upload to R2
  await Promise.all([
    putToR2(pdfUploadUrl, pdfBytes, "application/pdf"),
    putToR2(coverUploadUrl, coverBytes, coverContentType),
  ]);

  // Save metadata to MongoDB
  const result = await createBookRecord({
    title,
    author:           "OpenStax",
    description:      `A free, peer-reviewed university textbook from OpenStax, openly licensed under Creative Commons. Used at thousands of colleges worldwide. Access the original at openstax.org.`,
    priceUGX:         priceForBook(),
    genre:            [genre],
    fileStorageKey:   pdfKey,
    coverStorageKey:  coverKey,
  });

  console.log(`  ✓ saved [${genre}] (id: ${result.bookId})`);
}

async function main() {
  const catalog = await fetchCatalog();
  console.log(`Found ${catalog.length} OpenStax books in catalog.\n`);

  // Filter to books that have a pdf_url and are published
  const importable = catalog.filter(b =>
    (b.pdf_url || b.high_resolution_pdf_url) &&
    b.title &&
    b.book_state !== "deprecated"
  );

  console.log(`${importable.length} books have downloadable PDFs. Starting import to ${SITE}...\n`);

  let ok = 0, fail = 0;

  for (const book of importable) {
    const genre = mapGenre(book);
    console.log(`→ ${book.title} [${genre}]`);
    try {
      await importOne(book, genre);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${book.title}: ${err.message}`);
      fail++;
    }
    // Be polite to OpenStax CDN
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n✅ Done. ${ok} imported, ${fail} failed.`);
}

main().catch((err) => {
  console.error("OpenStax import failed:", err);
  process.exit(1);
});
