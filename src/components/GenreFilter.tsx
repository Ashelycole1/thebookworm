"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import { Genre } from "@/types";
import { GENRES } from "@/data/books";

interface GenreFilterProps {
  active: "All" | Genre;
  onChange: (g: "All" | Genre) => void;
}

export default function GenreFilter({ active, onChange }: GenreFilterProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // When active changes, ensure the active pill is visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(".cat-pill.active");
    if (activeBtn) {
      // Smoothly center the active pill in the scroll container when possible
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      // Keep focus on the active item for keyboard users
      activeBtn.setAttribute("tabindex", "0");
    }
  }, [active]);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    // Allow arrow navigation across pills (acts like a tablist)
    const container = scrollRef.current;
    if (!container) return;
    const focusable = Array.from(container.querySelectorAll<HTMLButtonElement>(".cat-pill"));
    if (focusable.length === 0) return;

    const activeIndex = focusable.findIndex((b) => document.activeElement === b || b.classList.contains("active"));
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = focusable[Math.min(focusable.length - 1, Math.max(0, activeIndex + 1))];
      next.focus();
      next.click();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = focusable[Math.max(0, activeIndex - 1)];
      prev.focus();
      prev.click();
    }
  }

  return (
    <div className="genre-filter-wrap" style={{ marginTop: 28 }}>
      <div
        className="genre-scroll"
        ref={scrollRef}
        role="tablist"
        aria-label="Book categories"
        tabIndex={0}
        onKeyDown={onKey}
        style={{ display: "flex", gap: 10, paddingBottom: 4 }}
      >
        {GENRES.map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={active === g}
            onClick={() => onChange(g)}
            className={`cat-pill${active === g ? " active" : ""}`}
            // allow keyboard focus when not active
            tabIndex={active === g ? 0 : -1}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
