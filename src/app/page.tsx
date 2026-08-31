"use client";

import { useState, useMemo, useCallback } from "react";
import { Book, CartLine, Genre } from "@/types";
import { BOOKS } from "@/data/books";
import { useCurrency } from "@/hooks/useCurrency";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GenreFilter from "@/components/GenreFilter";
import BookGrid from "@/components/BookGrid";
import DetailModal from "@/components/DetailModal";
import CartDrawer from "@/components/CartDrawer";
import NylonPayModal from "@/components/NylonPayModal";

export default function Home() {
  const currency = useCurrency();

  // Filter state
  const [genre, setGenre] = useState<"All" | Genre>("All");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Cart & wishlist
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Detail modal
  const [selected, setSelected] = useState<Book | null>(null);

  // Nylon Pay
  const [nylonOpen, setNylonOpen] = useState(false);

  // Derived
  const filtered = useMemo(() => {
    return BOOKS.filter((b) => {
      const genreOk = genre === "All" || b.genre === genre;
      const q = query.trim().toLowerCase();
      const queryOk =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      return genreOk && queryOk;
    });
  }, [genre, query]);

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const selectedTotal = useMemo(() => {
    return cart
      .filter((c) => c.checked)
      .reduce((sum, c) => {
        const book = BOOKS.find((b) => b.id === c.id);
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

  const changeQty = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const toggleChecked = useCallback((id: number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  }, []);

  const toggleWishlist = useCallback((id: number) => {
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

        <GenreFilter active={genre} onChange={setGenre} />

        <section
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "20px 24px 80px",
          }}
        >
          <BookGrid
            books={filtered}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onSelect={openDetail}
            currency={currency}
          />
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>The Bookworm — twelve books, no subscriptions.</span>
          <span>Files delivered instantly after purchase.</span>
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
        books={BOOKS}
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
          onClose={() => setNylonOpen(false)}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}
