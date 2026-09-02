"use client";

import Image from "next/image";
import Link from "next/link";
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
  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://chat.whatsapp.com/your-community-code";
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo-ring">
            <Image
              src="/logo-icon.png"
              alt="The Bookworm"
              width={34}
              height={34}
              priority
              style={{ width: 34, height: 'auto', display: 'block' }}
            />
          </div>
          <div className="header-brand-text">
            <span className="header-wordmark">The Bookworm</span>
            <span className="header-tagline">Books. Resources. Growth.</span>
          </div>
        </div>

        <nav className="header-nav" aria-label="Primary navigation">
          <ul className="nav-list">
            <li><Link href="/" className="nav-link">Browse</Link></li>
            <li><Link href="/lookup" className="nav-link">Lookup</Link></li>
            <li><Link href="/terms" className="nav-link">Terms</Link></li>
          </ul>
        </nav>

        <div className="header-actions">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="header-whatsapp-btn"
            aria-label="Join The Bookworm WhatsApp community"
            title="Join The Bookworm WhatsApp community"
          >
            <img src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
            <span className="whatsapp-label">Join</span>
          </a>
          <div className={`header-search-wrap${searchOpen ? ' open' : ''}`}>
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
              aria-label={searchOpen ? 'Close search' : 'Open search'}
            >
              {searchOpen ? <X size={17} strokeWidth={2} /> : <Search size={17} strokeWidth={2} />}
            </button>
          </div>

          <button
            className="header-cart-btn"
            onClick={onCartOpen}
            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
          >
            <ShoppingBag size={17} strokeWidth={2} />
            <span className="header-cart-label">{cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''}` : 'Cart'}</span>
            {cartCount > 0 && <span className="cart-badge" aria-hidden="true">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
 
