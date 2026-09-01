"use client";

import React from "react";
import { Book, CurrencyConfig } from "@/types";
import Cover from "./Cover";
import Rating from "./Rating";
import { formatPrice } from "@/lib/currency";

interface BookCardProps {
  book: Book;
  wishlisted: boolean;
  onToggleWishlist: (id: string | number) => void;
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
      <div className="book-card-content">
        <div className="book-card-title">
          {book.title}
        </div>
        <div className="book-card-meta">
          <span className="book-card-author">
            {book.author}
          </span>
          <Rating value={book.rating} />
        </div>
        <div className="book-card-price">
          {formatPrice(book.price, currency)}
        </div>
      </div>
    </article>
  );
}
