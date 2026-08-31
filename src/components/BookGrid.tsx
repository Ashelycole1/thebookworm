"use client";

import { Book } from "@/types";
import { CurrencyConfig } from "@/types";
import BookCard from "./BookCard";

interface BookGridProps {
  books: Book[];
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  onSelect: (book: Book) => void;
  currency: CurrencyConfig;
}

export default function BookGrid({
  books,
  wishlist,
  onToggleWishlist,
  onSelect,
  currency,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-title">Nothing on the shelf matches that.</p>
        <p className="empty-state-sub">
          Try a different title, author, or genre.
        </p>
      </div>
    );
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          wishlisted={wishlist.includes(book.id)}
          onToggleWishlist={onToggleWishlist}
          onSelect={onSelect}
          currency={currency}
        />
      ))}
    </div>
  );
}
