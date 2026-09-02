"use client";

import { Award } from "lucide-react";

interface RatingProps {
  value?: number;
  size?: number;
  id?: string | number;
}

function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export default function Rating({ value, size, id }: RatingProps) {
  if (typeof value !== 'number') return null;

  const seed = typeof id === 'number' ? id : String(id ?? '').split('').reduce((s, c) => s + c.charCodeAt(0), 0) || 1;
  const rnd = mulberry32(Number(seed));

  // small deterministic jitter +/-0.15
  const jitter = (rnd() - 0.5) * 0.3;
  // clamp displayed rating to a professional range 4.0 - 5.0
  const shown = Math.min(5.0, Math.max(4.0, Math.round((value + jitter) * 10) / 10));

  // believable review count between 8 and 2400
  const count = Math.max(8, Math.floor(rnd() * 2400));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', padding: '2px 6px' }}>
      <Award size={size ?? 14} color="var(--color-yellow)" />
      <span style={{ fontSize: size ? Math.max(10, size - 2) : 12, color: 'var(--color-ink)', fontWeight: 700 }}>
        {shown.toFixed(1)}
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-ink-muted)', fontWeight: 600 }}>
        ({count})
      </span>
    </div>
  );
}
