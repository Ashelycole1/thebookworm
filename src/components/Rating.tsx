"use client";

import { Award } from "lucide-react";

interface RatingProps {
  value?: number;
  size?: number;
}

export default function Rating({ value, size }: RatingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--color-bg)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--color-border)" }}>
      <Award size={12} color="var(--color-ink-muted)" />
      <span
        style={{
          fontSize: 10,
          color: "var(--color-ink-muted)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}
      >
        Hand-picked
      </span>
    </div>
  );
}
