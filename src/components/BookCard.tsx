"use client";

import React from "react";
import { Book, CurrencyConfig } from "@/types";
import Cover from "./Cover";
import Rating from "./Rating";
import { formatPrice } from "@/lib/currency";

interface BookCardProps {
  book: Book;
  wishlisted: boolean;
  onToggleWishlist: (id: number) => void;
  onSelect: (book: Book) => void;
  currency: CurrencyConfig;
}

export default function BookCard({
  book,
  wishlisted,
  onToggleWishlist,
  onSelect,
  currency,
}: BookCardProps) {
  return (
    <article
      className="book-card"
      onClick={() => onSelect(book)}
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: 18,
        padding: 12,
        cursor: "pointer",
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${book.title} by ${book.author}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(book);
        }
      }}
    >
      <Cover
        book={book}
        wishlisted={wishlisted}
        onToggleWishlist={onToggleWishlist}
      />
      <div style={{ marginTop: 12, padding: "0 3px" }}>
        <div
          style={
            {
              fontWeight: 800,
              fontSize: "0.85rem",
              lineHeight: 1.25,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as React.CSSProperties
          }
        >
          {book.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <span
            style={{
              color: "var(--color-ink-muted)",
              fontSize: "0.76rem",
              fontWeight: 500,
            }}
          >
            {book.author}
          </span>
          <Rating value={book.rating} />
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: "0.95rem",
            color: "var(--color-green)",
            marginTop: 10,
          }}
        >
          {formatPrice(book.price, currency)}
        </div>
      </div>
    </article>
  );
}
