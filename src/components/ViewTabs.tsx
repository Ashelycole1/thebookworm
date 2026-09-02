"use client";

import React from "react";

interface ViewTabsProps {
  view: "grid" | "list";
  onChange: (v: "grid" | "list") => void;
}

export default function ViewTabs({ view, onChange }: ViewTabsProps) {
  return (
    <div className="view-tabs" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        className={`cat-pill ${view === 'grid' ? 'active' : ''}`}
        onClick={() => onChange('grid')}
        aria-pressed={view === 'grid'}
      >
        Grid
      </button>
      <button
        className={`cat-pill ${view === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
        aria-pressed={view === 'list'}
      >
        List
      </button>
    </div>
  );
}
