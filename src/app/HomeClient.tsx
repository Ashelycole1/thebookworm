"use client";

import Link from "next/link";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Book, CartLine, Genre } from "@/types";
import { useCurrency } from "@/hooks/useCurrency";
import Header from "@/components/Header";
import Hero from "../components/Hero";
import GenreFilter from "@/components/GenreFilter";
import BookGrid from "@/components/BookGrid";
import BookList from "@/components/BookList";
import ViewTabs from "@/components/ViewTabs";
import DetailModal from "@/components/DetailModal";
import CartDrawer from "@/components/CartDrawer";
import NylonPayModal from "@/components/NylonPayModal";

interface HomeClientProps {
  initialBooks: Book[];
  initialBookId?: string;
}

export default function HomeClient({ initialBooks, initialBookId }: HomeClientProps) {
  const currency = useCurrency();

  // Filter state
  const [genre, setGenre] = useState<"All" | Genre>("All");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Books state — seeded from server so they appear instantly
  const [books] = useState<Book[]>(initialBooks);

  // Cart & wishlist
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<(string | number)[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Detail modal — open directly if a ?book= param was passed
  const [selected, setSelected] = useState<Book | null>(
    initialBookId
      ? (initialBooks.find((b) => String(b.id) === initialBookId) ?? null)
      : null
  );

  // Nylon Pay
  const [nylonOpen, setNylonOpen] = useState(false);

  // Derived
  const filtered = useMemo(() => {
    return books.filter((b) => {
      // Check if genre matches (handle both array and single string temporarily)
      const bookGenres = Array.isArray(b.genre) ? b.genre : [b.genre];
      const genreOk = genre === "All" || bookGenres.includes(genre);
      
      const q = query.trim().toLowerCase();
      const queryOk =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      return genreOk && queryOk;
    });
  }, [books, genre, query]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [genre, query]);

  // Compute paginated books
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const [view, setView] = useState<"grid" | "list">("grid");

  const selectedTotal = useMemo(() => {
    return cart
      .filter((c) => c.checked)
      .reduce((sum, c) => {
        const book = books.find((b) => b.id === c.id);
        return sum + (book?.price ?? 0) * c.qty;
      }, 0);
  }, [cart]);

  // Handlers
  const openDetail = useCallback((book: Book) => {
    setSelected(book);
  }, []);

  const closeDetail = useCallback(() => {
    setSelected(null);
  }, []);

  const addToCart = useCallback((book: Book, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === book.id);
      if (existing) {
        return prev.map((c) =>
          c.id === book.id ? { ...c, qty: c.qty + qty, checked: true } : c
        );
      }
      return [...prev, { id: book.id, qty, checked: true }];
    });
  }, []);

  const changeQty = useCallback((id: string | number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const toggleChecked = useCallback((id: string | number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  }, []);

  const toggleWishlist = useCallback((id: string | number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }, []);

  function handleCheckout() {
    setCartOpen(false);
    setNylonOpen(true);
  }

  function handlePaySuccess() {
    setNylonOpen(false);
    setCart([]);
  }

  function handleSearchToggle() {
    setSearchOpen((s) => {
      if (s) setQuery(""); // clear on close
      return !s;
    });
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        searchOpen={searchOpen}
        onSearchToggle={handleSearchToggle}
        query={query}
        onQueryChange={setQuery}
      />

      <main>
        <Hero />
        
        <section className="container" style={{ padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, padding: "24px", background: "var(--color-card)", margin: "0 auto 32px", maxWidth: 800, borderRadius: 16, border: "1px solid var(--color-border)" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ background: "#0ea5e9", color: "white", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, fontSize: "0.9rem", fontWeight: 800, margin: "0 auto 12px" }}>1</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>Select Book</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)", lineHeight: 1.4 }}>Find your desired book and add it to cart.</p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ background: "#0ea5e9", color: "white", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, fontSize: "0.9rem", fontWeight: 800, margin: "0 auto 12px" }}>2</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>Pay via MTN/Airtel</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)", lineHeight: 1.4 }}>Quick and secure Mobile Money payment.</p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ background: "#0ea5e9", color: "white", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, fontSize: "0.9rem", fontWeight: 800, margin: "0 auto 12px" }}>3</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>Download Instantly</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)", lineHeight: 1.4 }}>Get immediate access to your PDF.</p>
            </div>
          </div>
        </section>

        <GenreFilter active={genre} onChange={setGenre} />

        <section className="container section-gap" style={{ paddingBottom: 100 }}>
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <ViewTabs view={view} onChange={setView} />
            </div>
            {view === 'grid' ? (
              <BookGrid
                books={paginatedBooks}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                onSelect={openDetail}
                currency={currency}
              />
            ) : (
              <BookList
                books={paginatedBooks}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                onSelect={openDetail}
                currency={currency}
              />
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrap">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-top">
            <span className="footer-brand-desc">
              The Bookworm — The digital archive for developers, students, and curious minds.
            </span>
            <span className="footer-value-prop">
              Pay once via Mobile Money &bull; Download instantly &bull; Keep forever.
            </span>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">
              &copy; 2026 The Bookworm
            </span>
            <div className="footer-links" style={{ display: "flex", gap: "32px", justifyContent: "center", fontWeight: 500, fontSize: "1rem", marginTop: "16px" }}>
              <Link href="/lookup" style={{ color: "var(--color-ink)", textDecoration: "none" }}>Find My Books</Link>
              <a href="/terms" style={{ color: "var(--color-ink)", textDecoration: "none" }}>Terms of Use</a>
              <a href="/privacy" style={{ color: "var(--color-ink)", textDecoration: "none" }}>Privacy Policy</a>
              <a href="/disclaimer" style={{ color: "var(--color-ink)", textDecoration: "none" }}>Disclaimers</a>
            </div>
            <span className="footer-credit">
              Made by <a href="https://www.linkedin.com/company/renoa-collective/" target="_blank" rel="noopener noreferrer">RENOA</a>
            </span>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          book={selected}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={addToCart}
          onClose={closeDetail}
          currency={currency}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        cart={cart}
        books={books}
        onClose={() => setCartOpen(false)}
        onQtyChange={changeQty}
        onToggleChecked={toggleChecked}
        onCheckout={handleCheckout}
        currency={currency}
      />

      {/* Nylon Pay */}
      {nylonOpen && (
        <NylonPayModal
          total={selectedTotal}
          currency={currency}
          cart={cart.filter(c => c.checked)}
          books={books}
          onClose={() => setNylonOpen(false)}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}
