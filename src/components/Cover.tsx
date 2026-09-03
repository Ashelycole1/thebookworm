"use client";

import { Heart } from "lucide-react";
import { Book } from "@/types";
import { palette } from "@/data/books";

interface CoverProps {
  book: Book;
  size?: "grid" | "detail" | "mini";
  wishlisted?: boolean;
  onToggleWishlist?: (id: string | number) => void;
}

export default function Cover({
  book,
  size = "grid",
  wishlisted = false,
  onToggleWishlist,
}: CoverProps) {
  // We can hash the string ID to get a stable color palette index
  const idNum = typeof book.id === 'string' ? book.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : book.id;
  const p = palette(idNum);
  const titleSize = size === "detail" ? "1.5rem" : size === "mini" ? "0.82rem" : "1rem";
  const authorSize = size === "detail" ? "0.85rem" : size === "mini" ? "0.62rem" : "0.72rem";
  const padding = size === "detail" ? "12% 12%" : size === "mini" ? "18% 12%" : "16% 16%";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "115%",
        background: book.coverImageUrl ? `url(${book.coverImageUrl}) center/cover no-repeat` : p.bg,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {onToggleWishlist && (
        <button
          className="icon-circle wishlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(book.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "none",
          }}
        >
          <Heart
            size={13}
            fill={wishlisted ? "var(--color-black)" : "none"}
            color="var(--color-black)"
            strokeWidth={1.8}
          />
        </button>
      )}
      {/* Only show the title overlay if there is no cover image */}
      {!book.coverImageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              color: p.text,
              fontSize: titleSize,
              lineHeight: 1.15,
            }}
          >
            {book.title}
          </div>
          <div
            style={{
              fontWeight: 500,
              color: p.text,
              opacity: 0.75,
              fontSize: authorSize,
              marginTop: 4,
            }}
          >
            {book.author}
          </div>
        </div>
      )}
    </div>
  );
}
