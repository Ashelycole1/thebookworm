"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, Plus, Minus, Check, Share2, CopyCheck } from "lucide-react";
import { Book, Format, CurrencyConfig } from "@/types";
import Cover from "./Cover";
import Rating from "./Rating";
import { formatPrice } from "@/lib/currency";

interface DetailModalProps {
  book: Book;
  wishlist: (string | number)[];
  onToggleWishlist: (id: string | number) => void;
  onAddToCart: (book: Book, qty: number) => void;
  onClose: () => void;
  currency: CurrencyConfig;
}

export default function DetailModal({
  book,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onClose,
  currency,
}: DetailModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<Format>(book.formats[0]);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  function handleShare() {
    const url = `${window.location.origin}/?book=${book.id}`;
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out ${book.title} on The Bookworm!`,
        url: url,
      }).catch((e) => console.log("Share failed", e));
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus first element on mount
  useEffect(() => {
    firstFocusRef.current?.focus();
  }, []);

  // Focus trap
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const modal = e.currentTarget;
    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(
        "button, input, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((el) => !el.hasAttribute("disabled"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  function handleAdd() {
    onAddToCart(book, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div
      className="modal-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${book.title} details`}
    >
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top row */}
        <div className="modal-toprow">
          <button
            ref={firstFocusRef}
            className="icon-circle"
            onClick={onClose}
            aria-label="Back to catalogue"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
          </button>
          <div className="modal-meta-row">
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {Array.isArray(book.genre) ? (
              book.genre.map((g, idx) => (
                <div key={idx} className="genre-badge">{g}</div>
              ))
            ) : (
              <div className="genre-badge">{book.genre}</div>
            )}
          </div>
          <div className="rating">
            <span>★</span> {book.rating.toFixed(1)}
          </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="icon-circle"
              onClick={handleShare}
              aria-label={copied ? "Link copied" : "Share"}
              style={copied ? { color: "var(--color-green)" } : undefined}
            >
              {copied ? <CopyCheck size={16} strokeWidth={2.2} /> : <Share2 size={16} strokeWidth={2.2} />}
            </button>
            <button
              ref={closeRef}
              className="icon-circle"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="detail-grid">
          {/* Cover */}
          <div className="detail-cover-wrap">
            <Cover
              book={book}
              size="detail"
              wishlisted={wishlist.includes(book.id)}
              onToggleWishlist={onToggleWishlist}
            />
          </div>

          {/* Info */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 className="detail-title">{book.title}</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 6,
              }}
            >
              <span
                style={{
                  color: "var(--color-ink-muted)",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                }}
              >
                {book.author}
              </span>
              <Rating value={book.rating} size={13} />
            </div>

            {/* Format selector */}
            <div style={{ marginTop: 20 }}>
              <div className="meta-label" style={{ marginBottom: 8 }}>
                SELECT FORMAT
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {book.formats.map((f) => (
                  <button
                    key={f}
                    className={`format-pill${selectedFormat === f ? " active" : ""}`}
                    onClick={() => setSelectedFormat(f)}
                    aria-pressed={selectedFormat === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: 20 }}>
              <div className="meta-label" style={{ marginBottom: 6 }}>
                DESCRIPTION
              </div>
              <p
                style={{
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  color: "var(--color-ink)",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {book.blurb}
              </p>
            </div>

            {/* Qty + Total */}
            <div className="detail-qty-row">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  className="step-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span
                  style={{
                    fontSize: "0.9rem",
                    minWidth: 16,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {qty}
                </span>
                <button
                  className="step-btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="meta-label">TOTAL PRICE</div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "var(--color-green)",
                  }}
                >
                  {formatPrice(book.price * qty, currency)}
                </div>
              </div>
            </div>

            {/* Add to cart */}
            <button
              className="btn-black"
              onClick={handleAdd}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "0.85rem",
                borderRadius: 999,
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                letterSpacing: "0.02em",
              }}
              aria-label={justAdded ? "Added to cart" : "Add to cart"}
            >
              {justAdded ? (
                <>
                  <Check size={16} /> ADDED
                </>
              ) : (
                "ADD TO CART"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
