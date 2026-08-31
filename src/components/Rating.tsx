"use client";

import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  size?: number;
}

export default function Rating({ value, size = 11 }: RatingProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <Star size={size} fill="var(--color-yellow)" color="var(--color-yellow)" strokeWidth={0} />
      <span
        style={{
          fontSize: size + 1,
          color: "var(--color-ink-muted)",
          fontWeight: 600,
        }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}
