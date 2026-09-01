"use client";

import { Genre } from "@/types";
import { GENRES } from "@/data/books";

interface GenreFilterProps {
  active: "All" | Genre;
  onChange: (g: "All" | Genre) => void;
}

export default function GenreFilter({ active, onChange }: GenreFilterProps) {
  return (
    <div className="genre-filter-wrap" style={{ marginTop: 28 }}>
      <div className="genre-scroll" style={{ display: "flex", gap: 10, paddingBottom: 4 }}>
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
