/**
 * Bulk upload script for "Bookworm Books" folder.
 * Generates a simple gradient PNG cover per book and posts to the local API.
 * Run: node scripts/bulkUpload.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKS_DIR = path.join(__dirname, "..", "Bookworm Books");
const API_URL = "http://localhost:3000/api/admin/books";

// ── Book metadata ──────────────────────────────────────────────────────────────
const BOOK_META = {
  "Artificial Intelligence Technology.pdf": {
    title: "Artificial Intelligence Technology",
    author: "Academic Press",
    description: "A comprehensive guide to modern artificial intelligence technology, covering machine learning, neural networks, and AI applications.",
    priceUGX: 25000,
    genre: ["Data Science", "Engineering"],
    color: [79, 70, 229],
  },
  "atcmorse.pdf": {
    title: "ATC Morse Code",
    author: "Francis",
    description: "A guide to Morse code for ATC (Air Traffic Control) communications and radio signaling.",
    priceUGX: 8000,
    genre: ["Engineering", "Education"],
    color: [16, 185, 129],
  },
  "ATOMIC HABITS BY JAMES CLEAR.pdf": {
    title: "Atomic Habits",
    author: "James Clear",
    description: "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.",
    priceUGX: 20000,
    genre: ["Business", "Essays"],
    color: [245, 158, 11],
  },
  "Bash Notes For Professionals @CodersCircle.pdf": {
    title: "Bash Notes For Professionals",
    author: "CodersCircle",
    description: "Compiled from Stack Overflow documentation, a professional reference for Bash shell scripting.",
    priceUGX: 10000,
    genre: ["Programming", "Education"],
    color: [34, 197, 94],
  },
  "Bash_Language_Summary.pdf": {
    title: "Bash Language Summary",
    author: "Open Source Authors",
    description: "A concise summary of the Bash scripting language, covering essential commands and syntax.",
    priceUGX: 5000,
    genre: ["Programming"],
    color: [34, 197, 94],
  },
  "Beginning Ethical Hacking with Kali Linux_ Computational Techniques for Resolving Security Issues ( PDFDrive ).pdf": {
    title: "Beginning Ethical Hacking with Kali Linux",
    author: "Sanjib Sinha",
    description: "Computational techniques for resolving security issues. A practical guide to ethical hacking using Kali Linux.",
    priceUGX: 22000,
    genre: ["Programming", "Engineering"],
    color: [239, 68, 68],
  },
  "BSE past papers .pdf": {
    title: "BSE Past Papers",
    author: "BSE Uganda",
    description: "Past examination papers for Uganda's Bachelor of Software Engineering program. Essential for revision and exam preparation.",
    priceUGX: 15000,
    genre: ["Education", "Engineering"],
    color: [99, 102, 241],
  },
  "Calculus_for_software_engineering_Students_percep.pdf": {
    title: "Calculus for Software Engineering Students",
    author: "Academic Press",
    description: "A focused introduction to calculus concepts essential for software engineering, covering derivatives, integrals, and applications.",
    priceUGX: 18000,
    genre: ["Mathematics", "Education"],
    color: [168, 85, 247],
  },
  "Chip War.pdf": {
    title: "Chip War",
    author: "Chris Miller",
    description: "The fight for the world's most critical technology — the inside story of the global semiconductor industry.",
    priceUGX: 20000,
    genre: ["Engineering", "Business"],
    color: [14, 165, 233],
  },
  "Cloud Computing Technology.pdf": {
    title: "Cloud Computing Technology",
    author: "Academic Press",
    description: "A thorough exploration of cloud computing concepts, architectures, service models, and deployment strategies.",
    priceUGX: 25000,
    genre: ["Engineering", "Data Science"],
    color: [6, 182, 212],
  },
  "COMM-SKILLS-NOTES (1).pdf": {
    title: "Communication Skills Notes",
    author: "Academic Press",
    description: "University-level lecture notes on communication skills, covering writing, presentations, and professional communication.",
    priceUGX: 8000,
    genre: ["Education"],
    color: [249, 115, 22],
  },
  "Computer organization and arch - WILLIAM STALLINGS_2084.pdf": {
    title: "Computer Organization and Architecture",
    author: "William Stallings",
    description: "The definitive textbook on computer organization and architecture, covering hardware design, instruction sets, and performance.",
    priceUGX: 30000,
    genre: ["Engineering", "Education"],
    color: [79, 70, 229],
  },
  "computer software (1).pdf": {
    title: "Computer Software",
    author: "Academic Press",
    description: "Fundamentals of computer software, covering software types, development, and system software concepts.",
    priceUGX: 8000,
    genre: ["Engineering", "Programming"],
    color: [107, 114, 128],
  },
  "Essentials of System Analysis by Valacich, George and Hoffer.pdf": {
    title: "Essentials of System Analysis",
    author: "Valacich, George & Hoffer",
    description: "A comprehensive guide to systems analysis and design, covering the full software development lifecycle.",
    priceUGX: 28000,
    genre: ["Engineering", "Education"],
    color: [16, 185, 129],
  },
  "git-cheat-sheet-education.pdf": {
    title: "Git Cheat Sheet",
    author: "GitHub Education",
    description: "The essential Git command reference for developers. Covers branching, merging, rebasing, and collaboration workflows.",
    priceUGX: 5000,
    genre: ["Programming"],
    color: [239, 68, 68],
  },
  "Introduction to Computation and Programming Using Python.pdf": {
    title: "Introduction to Computation and Programming Using Python",
    author: "John V. Guttag",
    description: "An MIT-style introduction to computational thinking and Python programming, ideal for beginners.",
    priceUGX: 22000,
    genre: ["Programming", "Education"],
    color: [59, 130, 246],
  },
  "Introduction to Java Programming.pdf": {
    title: "Introduction to Java Programming",
    author: "Y. Daniel Liang",
    description: "A comprehensive introduction to Java programming, covering OOP, data structures, and GUI development.",
    priceUGX: 25000,
    genre: ["Programming", "Education"],
    color: [239, 68, 68],
  },
  "Numerical Methods for Engineers, 7th Edition.pdf": {
    title: "Numerical Methods for Engineers (7th Ed.)",
    author: "Chapra & Canale",
    description: "The gold standard numerical methods textbook for engineers, covering algorithms for solving mathematical problems computationally.",
    priceUGX: 30000,
    genre: ["Mathematics", "Engineering"],
    color: [168, 85, 247],
  },
  "Python Notes For Profs.pdf": {
    title: "Python Notes For Professionals",
    author: "GoalKicker",
    description: "Comprehensive Python reference compiled from Stack Overflow documentation. Covers advanced patterns and practical examples.",
    priceUGX: 12000,
    genre: ["Programming", "Education"],
    color: [59, 130, 246],
  },
  "Python Programming for the Absolute Beginner- 3rd Edition.pdf": {
    title: "Python Programming for the Absolute Beginner",
    author: "Michael Dawson",
    description: "A beginner-friendly Python programming book using game development to teach core programming concepts.",
    priceUGX: 20000,
    genre: ["Programming", "Education"],
    color: [34, 197, 94],
  },
  "PYTHON PROGRAMMING NOTES.pdf": {
    title: "Python Programming Notes",
    author: "Academic Press",
    description: "University-level Python programming lecture notes covering variables, control flow, functions, and OOP.",
    priceUGX: 8000,
    genre: ["Programming", "Education"],
    color: [59, 130, 246],
  },
  "Python_Cheat_Sheet_Made_by_Abdul_Malik.pdf": {
    title: "Python Cheat Sheet",
    author: "Abdul Malik",
    description: "A concise, practical Python cheat sheet covering syntax, data types, functions, and common libraries.",
    priceUGX: 5000,
    genre: ["Programming"],
    color: [59, 130, 246],
  },
  "Python_Functions.pdf": {
    title: "Python Functions",
    author: "Academic Press",
    description: "A focused deep-dive into Python functions — parameters, closures, decorators, and functional programming patterns.",
    priceUGX: 7000,
    genre: ["Programming"],
    color: [59, 130, 246],
  },
  "React JS.pdf": {
    title: "React JS",
    author: "Open Source Authors",
    description: "A practical guide to React JS, covering components, hooks, state management, and building modern web applications.",
    priceUGX: 15000,
    genre: ["Programming", "Engineering"],
    color: [14, 165, 233],
  },
  "SecretLearningMorseCodeFrancis.pdf": {
    title: "Secret Learning: Morse Code",
    author: "Francis",
    description: "A unique guide to learning Morse code through secret techniques and mnemonics for rapid memorization.",
    priceUGX: 8000,
    genre: ["Education"],
    color: [16, 185, 129],
  },
  "Software Engineering.pdf": {
    title: "Software Engineering",
    author: "Academic Press",
    description: "Foundational software engineering principles including requirements, design, testing, and project management.",
    priceUGX: 18000,
    genre: ["Engineering", "Education"],
    color: [79, 70, 229],
  },
  "Software-Engineering-9th-Edition-by-Ian-Sommerville.pdf": {
    title: "Software Engineering (9th Edition)",
    author: "Ian Sommerville",
    description: "The definitive software engineering textbook, 9th edition. Covers agile methods, architecture, and dependability.",
    priceUGX: 30000,
    genre: ["Engineering", "Education"],
    color: [79, 70, 229],
  },
  "Software-Engineering-By-Ian-Sommerville-8th-Edition.pdf": {
    title: "Software Engineering (8th Edition)",
    author: "Ian Sommerville",
    description: "Ian Sommerville's classic software engineering textbook, 8th edition. A must-have for CS/SE students.",
    priceUGX: 28000,
    genre: ["Engineering", "Education"],
    color: [99, 102, 241],
  },
  "System Analysis and Design by Shelly and Rosenbaltt 9th Edition.pdf": {
    title: "System Analysis and Design (9th Ed.)",
    author: "Shelly & Rosenblatt",
    description: "Comprehensive coverage of systems analysis and design methods, 9th edition.",
    priceUGX: 30000,
    genre: ["Engineering", "Education"],
    color: [16, 185, 129],
  },
  "System Analysis and Design by Shelly and Rosenblatt 8th edition.pdf": {
    title: "System Analysis and Design (8th Ed.)",
    author: "Shelly & Rosenblatt",
    description: "The classic systems analysis and design textbook, 8th edition, by Shelly and Rosenblatt.",
    priceUGX: 28000,
    genre: ["Engineering", "Education"],
    color: [16, 185, 129],
  },
  "system_analysis_and_design_tutorial.pdf": {
    title: "System Analysis and Design Tutorial",
    author: "TutorialsPoint",
    description: "A concise tutorial on system analysis and design concepts, covering methodologies and practical examples.",
    priceUGX: 8000,
    genre: ["Engineering", "Education"],
    color: [16, 185, 129],
  },
  "THE 48 LAWS OF POWER BY ROBERT GREENE.pdf": {
    title: "The 48 Laws of Power",
    author: "Robert Greene",
    description: "The bestselling guide to power and strategy, drawing on history's most powerful figures. Essential reading for leaders.",
    priceUGX: 20000,
    genre: ["Business", "Essays"],
    color: [30, 27, 75],
  },
  "The-perfect-French-500-most-common-French-verbs.pdf": {
    title: "The Perfect French: 500 Most Common Verbs",
    author: "Language Press",
    description: "Master French with the 500 most commonly used verbs, complete with conjugations and example sentences.",
    priceUGX: 10000,
    genre: ["Education"],
    color: [14, 165, 233],
  },
  "TheCodeBook_RobertBetts_Ed1Pr1_1995_text.pdf": {
    title: "The Code Book",
    author: "Robert Betts",
    description: "A fascinating exploration of codes, ciphers, and cryptography throughout history and into the digital age.",
    priceUGX: 15000,
    genre: ["Engineering", "Programming"],
    color: [239, 68, 68],
  },
};

// ── PNG builder (no external deps) ────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF);
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(crcData) >>> 0, 0);
  return Buffer.concat([lenBuf, typeBuffer, data, crcBuf]);
}

function buildPNG(r, g, b) {
  const W = 200, H = 280;
  const PNG_SIG = Buffer.from([137,80,78,71,13,10,26,10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(W, 0);
  ihdrData.writeUInt32BE(H, 4);
  ihdrData.writeUInt8(8, 8);  // bit depth
  ihdrData.writeUInt8(2, 9);  // RGB
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  // Build raw image rows: filter_byte (0) + RGB per pixel
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    const rowOffset = y * (1 + W * 3);
    raw[rowOffset] = 0; // None filter
    for (let x = 0; x < W; x++) {
      // Radial vignette: darken edges slightly
      const fx = (x - W/2) / (W/2);
      const fy = (y - H/2) / (H/2);
      const vignette = 1 - 0.35 * Math.sqrt(fx*fx + fy*fy);
      raw[rowOffset + 1 + x*3]     = Math.min(255, Math.round(r * vignette));
      raw[rowOffset + 1 + x*3 + 1] = Math.min(255, Math.round(g * vignette));
      raw[rowOffset + 1 + x*3 + 2] = Math.min(255, Math.round(b * vignette));
    }
  }

  const compressed = deflateSync(raw, { level: 6 });
  return Buffer.concat([
    PNG_SIG,
    makeChunk("IHDR", ihdrData),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Upload ─────────────────────────────────────────────────────────────────────
async function uploadBook(filename, meta) {
  const pdfPath = path.join(BOOKS_DIR, filename);
  if (!fs.existsSync(pdfPath)) {
    console.warn(`  ⚠ File not found: ${filename}`);
    return false;
  }

  const [r, g, b] = meta.color;
  const pngBuffer = buildPNG(r, g, b);
  const pdfBuffer = fs.readFileSync(pdfPath);
  const safePdf = filename.replace(/[^a-zA-Z0-9.\-]/g, "_");
  const safePng = safePdf.replace(/\.pdf$/i, ".png");

  const formData = new FormData();
  formData.append("title", meta.title);
  formData.append("author", meta.author);
  formData.append("description", meta.description);
  formData.append("priceUGX", String(meta.priceUGX));
  for (const g of meta.genre) formData.append("genre", g);
  formData.append("coverImage", new Blob([pngBuffer], { type: "image/png" }), safePng);
  formData.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), safePdf);

  try {
    const res = await fetch(API_URL, { method: "POST", body: formData });
    const json = await res.json();
    if (res.ok) {
      console.log(`  ✓ "${meta.title}"`);
      return true;
    } else {
      console.error(`  ✗ "${meta.title}" → ${json.error}`);
      return false;
    }
  } catch (err) {
    console.error(`  ✗ "${meta.title}" → ${err.message}`);
    return false;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith(".pdf"));
  console.log(`\n📚 Found ${files.length} PDFs. Starting bulk upload to ${API_URL}...\n`);

  let success = 0, fail = 0;

  for (const file of files) {
    const meta = BOOK_META[file];
    if (!meta) {
      console.warn(`  ⚠ No metadata for: ${file}`);
      fail++;
      continue;
    }
    process.stdout.write(`→ Uploading: ${meta.title.slice(0, 55)}... `);
    const ok = await uploadBook(file, meta);
    if (ok) success++; else fail++;
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n✅ Done! ${success} uploaded successfully, ${fail} failed.\n`);
}

main().catch(console.error);
