"use client";

import { Heart } from "lucide-react";
import { Book } from "@/types";
import { palette } from "@/data/books";

interface CoverProps {
  book: Book;
  size?: "grid" | "detail";
  wishlisted?: boolean;
  onToggleWishlist?: (id: number) => void;
}

export default function Cover({
  book,
  size = "grid",
  wishlisted = false,
  onToggleWishlist,
}: CoverProps) {
  const p = palette(book.id);
  const titleSize = size === "grid" ? "1rem" : "1.5rem";
  const authorSize = size === "grid" ? "0.72rem" : "0.85rem";
  const padding = size === "grid" ? "16% 16%" : "12% 12%";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "115%",
        background: p.bg,
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
    </div>
  );
}
