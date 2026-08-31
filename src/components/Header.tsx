"use client";

import Image from "next/image";
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

        {/* ── Brand ── */}
        <div className="header-brand">
          <div className="header-logo-ring">
            <Image
              src="/logo-icon.png"
              alt="The Bookworm"
              width={34}
              height={34}
              priority
              style={{ width: 34, height: "auto", display: "block" }}
            />
          </div>
          <div className="header-brand-text">
            <span className="header-wordmark">The Bookworm</span>
            <span className="header-tagline">Books · Resources · Growth</span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="header-actions">
          {/* Expanding search */}
          <div className={`header-search-wrap${searchOpen ? " open" : ""}`}>
            {searchOpen && (
              <input
                className="header-search-input"
                autoFocus
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search title or author…"
                aria-label="Search books"
              />
            )}
            <button
              className="header-icon-btn"
              onClick={onSearchToggle}
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              {searchOpen ? (
                <X size={17} strokeWidth={2} />
              ) : (
                <Search size={17} strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Cart */}
          <button
            className="header-cart-btn"
            onClick={onCartOpen}
            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <ShoppingBag size={17} strokeWidth={2} />
            {cartCount > 0 ? (
              <span className="header-cart-label">{cartCount} item{cartCount > 1 ? "s" : ""}</span>
            ) : (
              <span className="header-cart-label">Cart</span>
            )}
            {cartCount > 0 && (
              <span className="cart-badge" aria-hidden="true">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
