"use client";

import React from "react";

import { COVER_PALETTES } from "@/data/books";

export default function Hero() {
  return (
    <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 0" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          background: "var(--color-yellow-soft)",
          borderRadius: 24,
          overflow: "hidden",
          padding: "36px 32px",
        }}
        className="hero-grid"
      >
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "0.78rem",
              color: "var(--color-ink-muted)",
              letterSpacing: "0.03em",
            }}
          >
            NEW
          </div>
          <h1 className="hero-headline">
            This month&apos;s
            <br />
            arrivals
          </h1>
          <p className="hero-sub">
            Twelve books, hand-picked. Buy once, download instantly, keep forever.
          </p>
        </div>

        <div className="hero-books">
          {([0, 1, 2] as const).map((i) => {
            const p = COVER_PALETTES[i];
            const heights = [150, 180, 140];
            const rotations = [-6, 0, 6];
            return (
              <div
                key={i}
                style={{
                  width: 90,
                  height: heights[i],
                  background: p.bg,
                  borderRadius: 14,
                  transform: `rotate(${rotations[i]}deg)`,
                  boxShadow: "0 16px 30px -14px rgba(30,30,28,0.35)",
                  flexShrink: 0,
                }}
              ></div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
