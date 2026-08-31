"use client";

import { Search, ShoppingBag, X } from "lucide-react";

interface HeaderProps {
  cartCount: number;
  onCartOpen: () => void;
  searchOpen: boolean;
  onSearchToggle: () => void;
  query: string;
  onQueryChange: (q: string) => void;
}

export default function Header({
  cartCount,
  onCartOpen,
  searchOpen,
  onSearchToggle,
  query,
  onQueryChange,
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="wordmark">THE BOOKWORM</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="icon-circle"
            onClick={onSearchToggle}
            aria-label={searchOpen ? "Close search" : "Open search"}
          >
            {searchOpen ? (
              <X size={16} strokeWidth={2} color="var(--color-ink)" />
            ) : (
              <Search size={16} strokeWidth={2} color="var(--color-ink)" />
            )}
          </button>
          <button
            className="icon-circle"
            onClick={onCartOpen}
            aria-label="Open cart"
            style={{ position: "relative" }}
          >
            <ShoppingBag size={16} strokeWidth={2} color="var(--color-ink)" />
            {cartCount > 0 && (
              <span className="cart-badge" aria-label={`${cartCount} items`}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="container" style={{ paddingBottom: 16 }}>
          <div className="search-bar">
            <Search size={15} strokeWidth={2} color="var(--color-ink-muted)" />
            <input
              className="search-input"
              autoFocus
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by title or author"
              aria-label="Search books"
            />
          </div>
        </div>
      )}
    </header>
  );
}
