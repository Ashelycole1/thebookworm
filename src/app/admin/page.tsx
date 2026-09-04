"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import { Upload, Book, FileText, ImageIcon, DollarSign, Tag, Pencil, Trash2, ToggleLeft, ToggleRight, Check, X, Link, Star } from "lucide-react";

const GENRES = [
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

interface AdminBook {
  _id: string;
  title: string;
  author: string;
  description: string;
  priceUGX: number;
  coverImageUrl: string;
  isAvailable: boolean;
  featured: boolean;
  genre: string[];
}

interface EditState {
  title: string;
  author: string;
  description: string;
  priceUGX: string;
  genre: string[];
}

export default function AdminPage() {
  const [tab, setTab] = useState<"upload" | "manage">("upload");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [adminActive, setAdminActive] = useState(false);

  useEffect(() => {
    try {
      const ok = sessionStorage.getItem("allowAdmin");
      if (!ok) {
        router.replace("/");
        return;
      }
      // show Manage tab when arriving via the footer link and persist the admin session
      setTab("manage");
      setAdminActive(true);
    } catch (e) {
      router.replace("/");
    }
  }, [router]);

  

  // --- Upload state ---
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedCover, setSelectedCover] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // --- Manage state ---
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadGenres, setUploadGenres] = useState<string[]>(["Fiction"]);
  const [editState, setEditState] = useState<EditState>({ title: "", author: "", description: "", priceUGX: "", genre: ["Fiction"] });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const res = await fetch("/api/admin/books");
      const data = await res.json();
      setBooks(data);
    } catch {
      console.error("Failed to load books");
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  // Persist admin session across refreshes while `adminActive` is true
  useEffect(() => {
    try {
      if (adminActive) sessionStorage.setItem("allowAdmin", "1");
      else sessionStorage.removeItem("allowAdmin");
    } catch (e) {}
  }, [adminActive]);

  useEffect(() => {
    if (tab === "manage") fetchBooks();
  }, [tab, fetchBooks]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => {
      const title = (b.title || "").toLowerCase();
      const author = (b.author || "").toLowerCase();
      const genres = (Array.isArray(b.genre) ? b.genre : [b.genre]).join(" ").toLowerCase();
      return title.includes(q) || author.includes(q) || genres.includes(q);
    });
  }, [books, searchQuery]);

  // --- Upload handler ---
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setUploadMsg(null);

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const author = (form.elements.namedItem("author") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const priceUGX = (form.elements.namedItem("priceUGX") as HTMLInputElement).value;
    const coverImageFile = (form.elements.namedItem("coverImage") as HTMLInputElement).files?.[0];
    const pdfFile = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];

    if (!coverImageFile || !pdfFile) {
      setUploadMsg({ type: "error", text: "Please select both a cover image and a PDF file." });
      setUploading(false);
      return;
    }

    try {
      // Step 1: Get presigned PUT URLs from our API (tiny JSON request, no file data)
      setUploadMsg({ type: "error", text: "" }); // clear
      const presignRes = await fetch("/api/admin/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfFilename: pdfFile.name,
          pdfContentType: pdfFile.type || "application/pdf",
          coverFilename: coverImageFile.name,
          coverContentType: coverImageFile.type || "image/jpeg",
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || `Presign failed (${presignRes.status})`);
      }

      const { pdfUploadUrl, pdfKey, coverUploadUrl, coverKey } = await presignRes.json();

      // Step 2: Upload PDF and cover image DIRECTLY to R2 (bypasses Vercel limits)
      const [pdfUpload, coverUpload] = await Promise.all([
        fetch(pdfUploadUrl, {
          method: "PUT",
          headers: { "Content-Type": pdfFile.type || "application/pdf" },
          body: pdfFile,
        }),
        fetch(coverUploadUrl, {
          method: "PUT",
          headers: { "Content-Type": coverImageFile.type || "image/jpeg" },
          body: coverImageFile,
        }),
      ]);

      if (!pdfUpload.ok) throw new Error(`PDF upload to storage failed (${pdfUpload.status})`);
      if (!coverUpload.ok) throw new Error(`Cover upload to storage failed (${coverUpload.status})`);

      // Step 3: Save metadata to MongoDB (tiny JSON, no files)
      const metaRes = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          description,
          priceUGX: Number(priceUGX),
          genre: uploadGenres,
          fileStorageKey: pdfKey,
          coverStorageKey: coverKey,
        }),
      });

      const metaData = await metaRes.json();
      if (!metaRes.ok) throw new Error(metaData.error || `Save failed (${metaRes.status})`);

      setUploadMsg({ type: "success", text: `"${title}" published successfully!` });
      (e.target as HTMLFormElement).reset();
      setSelectedCover(null);
      setSelectedFile(null);
      setUploadGenres(["Fiction"]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed — please try again.";
      setUploadMsg({ type: "error", text: msg });
      console.error("[Admin upload error]", err);
    } finally {
      setUploading(false);
    }
  }


  // --- Edit handlers ---
  function startEdit(book: AdminBook) {
    setEditingId(book._id);
    setEditCoverFile(null);
    setEditCoverPreview(null);
    setEditState({
      title: book.title,
      author: book.author,
      description: book.description,
      priceUGX: String(book.priceUGX),
      genre: Array.isArray(book.genre) ? book.genre : (book.genre ? [book.genre] : ["Fiction"]),
    });
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    try {
      let res: Response;
      if (editCoverFile) {
        // Use FormData when a new cover image has been selected
        const formData = new FormData();
        formData.append("title", editState.title);
        formData.append("author", editState.author);
        formData.append("description", editState.description);
        formData.append("priceUGX", String(Number(editState.priceUGX)));
        for (const g of editState.genre) formData.append("genre", g);
        formData.append("coverImage", editCoverFile);
        res = await fetch(`/api/admin/books/${id}`, { method: "PATCH", body: formData });
      } else {
        // No new image — send JSON as before
        res = await fetch(`/api/admin/books/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editState, priceUGX: Number(editState.priceUGX) }),
        });
      }
      if (res.ok) {
        setEditingId(null);
        setEditCoverFile(null);
        setEditCoverPreview(null);
        fetchBooks();
      } else {
        const err = await res.json();
        alert(err.error || "Save failed.");
      }
    } finally {
      setSavingId(null);
    }
  }

  async function toggleAvailability(id: string, current: boolean) {
    await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !current }),
    });
    fetchBooks();
  }

  async function toggleFeatured(id: string, current: boolean) {
    await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !current }),
    });
    fetchBooks();
  }

  async function deleteBook(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    fetchBooks();
  }

  async function copyDownloadLink(id: string, title: string) {
    try {
      const res = await fetch(`/api/admin/books/${id}/download`);
      if (!res.ok) throw new Error("Failed");
      const { url } = await res.json();
      await navigator.clipboard.writeText(url);
      alert(`Download link for "${title}" copied to clipboard!\n\nThis link is valid for 24 hours. You can send it to the customer.`);
    } catch (err) {
      alert("Error generating download link.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Upload and manage your digital books</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === "upload" ? styles.tabActive : ""}`} onClick={() => setTab("upload")}>
          <Upload size={16} /> Upload Book
        </button>
        <button className={`${styles.tab} ${tab === "manage" ? styles.tabActive : ""}`} onClick={() => setTab("manage")}>
          <Book size={16} /> Manage Books
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {adminActive ? (
            <button className={styles.refreshBtn} onClick={() => { setAdminActive(false); router.replace('/'); }} title="Exit admin">Exit Admin</button>
          ) : null}
        </div>
      </div>

      {/* ─── UPLOAD TAB ─────────────────────────────────── */}
      {tab === "upload" && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Upload New Book</h2>

          {uploadMsg && (
            <div className={`${styles.alert} ${uploadMsg.type === "success" ? styles.alertSuccess : styles.alertError}`}>
              {uploadMsg.text}
            </div>
          )}

          <form onSubmit={handleUpload} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Book Title</label>
              <div className={styles.inputWrapper}>
                <Book className={styles.inputIcon} size={20} />
                <input type="text" id="title" name="title" required placeholder="e.g. JavaScript: The Good Parts" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="author">Author</label>
              <div className={styles.inputWrapper}>
                <FileText className={styles.inputIcon} size={20} />
                <input type="text" id="author" name="author" required placeholder="e.g. Douglas Crockford" />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description (Optional)</label>
              <textarea id="description" name="description" rows={4} placeholder="Brief summary of the book..." className={styles.textarea}></textarea>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="priceUGX">Price (UGX)</label>
                <div className={styles.inputWrapper}>
                  <DollarSign className={styles.inputIcon} size={20} />
                  <input type="number" id="priceUGX" name="priceUGX" required min="0" placeholder="e.g. 15000" />
                </div>
              </div>
              <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                <label>Genres (Select up to 3)</label>
                <div className={styles.genreGrid}>
                  {GENRES.map(g => {
                    if (g === "All") return null;
                    return (
                      <label key={g} className={styles.genreCheckbox}>
                        <input
                          type="checkbox"
                          checked={uploadGenres.includes(g)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (uploadGenres.length < 3) {
                                setUploadGenres([...uploadGenres, g]);
                              }
                            } else {
                              setUploadGenres(uploadGenres.filter(ug => ug !== g));
                            }
                          }}
                        />
                        {g}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.fileRow}>
              <div className={styles.formGroup}>
                <label htmlFor="coverImage">Cover Image</label>
                <div className={styles.fileInputWrapper}>
                  <ImageIcon className={styles.fileIcon} size={24} />
                  <span className={styles.fileLabel}>
                    {selectedCover ? `✓ ${selectedCover}` : "Click to select image"}
                  </span>
                  <input
                    type="file"
                    id="coverImage"
                    name="coverImage"
                    required
                    accept="image/*"
                    onChange={e => setSelectedCover(e.target.files?.[0]?.name ?? null)}
                  />
                </div>
                <p className={styles.helpText}>JPEG or PNG, high quality.</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="file">Digital Book File</label>
                <div className={styles.fileInputWrapper}>
                  <Upload className={styles.fileIcon} size={24} />
                  <span className={styles.fileLabel}>
                    {selectedFile ? `✓ ${selectedFile}` : "Click to select PDF/EPUB"}
                  </span>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    required
                    accept="application/pdf,.epub"
                    onChange={e => setSelectedFile(e.target.files?.[0]?.name ?? null)}
                  />
                </div>
                <p className={styles.helpText}>PDF or EPUB file.</p>
              </div>
            </div>

            <button type="submit" disabled={uploading} className={styles.submitBtn}>
              {uploading ? "Uploading... (this may take a moment)" : "Publish Book"}
            </button>
          </form>
        </div>
      )}

      {/* ─── MANAGE TAB ─────────────────────────────────── */}
      {tab === "manage" && (
        <div className={styles.manageSection}>
          <div className={styles.manageTitleRow}>
            <h2 className={styles.formTitle} style={{ margin: 0 }}>All Books ({books.length})</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={styles.refreshBtn}
                style={{ background: "#fef3c7", borderColor: "var(--color-yellow)" }}
                onClick={async () => {
                  await fetch("/api/admin/books/restore", { method: "POST" });
                  fetchBooks();
                }}
                title="Makes all hidden books visible on the site"
              >
                Restore All Visible
              </button>
              <button className={styles.refreshBtn} onClick={fetchBooks}>Refresh</button>
            </div>
          </div>

          {/* Search row */}
          {tab === "manage" && (
            <div className={styles.searchRow} style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
              <div style={{ maxWidth: 560, width: '100%', display: 'flex', gap: 8 }}>
                <input
                  className={styles.searchInput}
                  placeholder="Search by title, author, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                />
                <button className={styles.refreshBtn} onClick={() => setSearchQuery("")}>Clear</button>
              </div>
            </div>
          )}

          {loadingBooks ? (
            <div className={styles.loadingMsg}>Loading books...</div>
          ) : filteredBooks.length === 0 ? (
            <div className={styles.loadingMsg}>No books found. Upload one first!</div>
          ) : (
            <div className={styles.bookList}>
              {filteredBooks.map((book) => (
                <div key={book._id} className={`${styles.bookRow} ${!book.isAvailable ? styles.bookRowDisabled : ""}`}>
                  {/* Cover thumbnail — clickable in edit mode */}
                  <div className={styles.bookThumb} style={editingId === book._id ? { cursor: "pointer", position: "relative" } : {}}>
                    {editingId === book._id ? (
                      <label style={{ cursor: "pointer", display: "block", width: "100%", height: "100%" }} title="Click to change cover image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editCoverPreview ?? book.coverImageUrl}
                          alt={book.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6, border: "2px dashed var(--color-accent)" }}
                        />
                        <div style={{
                          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          background: "rgba(0,0,0,0.45)", borderRadius: 6, color: "#fff", fontSize: "0.7rem",
                          fontWeight: 700, opacity: editCoverFile ? 0 : 1, transition: "opacity 0.2s"
                        }}>
                          Change Cover
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setEditCoverFile(file);
                            if (file) setEditCoverPreview(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                    ) : book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImageUrl} alt={book.title} />
                    ) : (
                      <div className={styles.noThumb}>?</div>
                    )}
                  </div>

                  {/* Info / Edit form */}
                  <div className={styles.bookInfo}>
                    {editingId === book._id ? (
                      <div className={styles.editForm}>
                        <input
                          value={editState.title}
                          onChange={e => setEditState(s => ({ ...s, title: e.target.value }))}
                          placeholder="Title"
                          className={styles.editInput}
                        />
                        <input
                          value={editState.author}
                          onChange={e => setEditState(s => ({ ...s, author: e.target.value }))}
                          placeholder="Author"
                          className={styles.editInput}
                        />
                        <textarea
                          value={editState.description}
                          onChange={e => setEditState(s => ({ ...s, description: e.target.value }))}
                          placeholder="Description"
                          rows={2}
                          className={styles.editInput}
                        />
                        <input
                          type="number"
                          value={editState.priceUGX}
                          onChange={e => setEditState(s => ({ ...s, priceUGX: e.target.value }))}
                          placeholder="Price (UGX)"
                          className={styles.editInput}
                        />
                        <div style={{ marginTop: 12 }}>
                          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-ink-muted)", marginBottom: 8, display: "block" }}>
                            Genres (Select up to 3)
                          </label>
                          <div className={styles.genreGrid}>
                            {GENRES.map(g => {
                              if (g === "All") return null;
                              return (
                                <label key={g} className={styles.genreCheckbox}>
                                  <input
                                    type="checkbox"
                                    checked={editState.genre.includes(g)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        if (editState.genre.length < 3) {
                                          setEditState(s => ({ ...s, genre: [...s.genre, g] }));
                                        }
                                      } else {
                                        setEditState(s => ({ ...s, genre: s.genre.filter(ug => ug !== g) }));
                                      }
                                    }}
                                  />
                                  {g}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.bookTitle}>{book.title}</div>
                        <div className={styles.bookMeta}>
                          <span>{book.author}</span>
                          <span className={styles.metaDot}>·</span>
                          <span>{Array.isArray(book.genre) ? book.genre.join(", ") : book.genre}</span>
                          <span className={styles.metaDot}>·</span>
                          <span className={styles.price}>USh {book.priceUGX.toLocaleString()}</span>
                        </div>
                        {book.description && (
                          <div className={styles.bookBlurb}>{book.description.slice(0, 100)}{book.description.length > 100 ? "…" : ""}</div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={styles.bookActions}>
                    {editingId === book._id ? (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.saveBtn}`}
                          onClick={() => saveEdit(book._id)}
                          disabled={savingId === book._id}
                          title="Save changes"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={styles.actionBtn}
                          onClick={() => copyDownloadLink(book._id, book.title)}
                          title="Copy Download Link (valid for 24hrs)"
                        >
                          <Link size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn}`}
                          style={book.featured ? { color: "#E8B930", background: "#fef3c7" } : {}}
                          onClick={() => toggleFeatured(book._id, book.featured)}
                          title={book.featured ? "Unpin from top" : "Pin to top of store"}
                        >
                          <Star size={16} fill={book.featured ? "#E8B930" : "none"} />
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => startEdit(book)}
                          title="Edit book"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${book.isAvailable ? styles.toggleOn : styles.toggleOff}`}
                          onClick={() => toggleAvailability(book._id, book.isAvailable)}
                          title={book.isAvailable ? "Hide from store" : "Show in store"}
                        >
                          {book.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => deleteBook(book._id, book.title)}
                          title="Delete book"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
