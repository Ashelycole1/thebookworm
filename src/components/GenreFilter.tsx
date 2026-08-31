"use client";

import { Genre } from "@/types";
import { GENRES } from "@/data/books";

interface GenreFilterProps {
  active: "All" | Genre;
  onChange: (g: "All" | Genre) => void;
}

export default function GenreFilter({ active, onChange }: GenreFilterProps) {
  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "28px 24px 8px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
        }}
      >
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={`cat-pill${active === g ? " active" : ""}`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
