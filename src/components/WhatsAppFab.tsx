"use client";

import React from "react";

const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_LINK ??
  "https://chat.whatsapp.com/your-community-code";

export default function WhatsAppFab() {
  const size = 52; // px
  const storageKey = "whatsappFabPos";
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const dragging = React.useRef(false);
  const dragOffset = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const moved = React.useRef(false);
  const elRef = React.useRef<HTMLAnchorElement | null>(null);

  // Load saved position from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setPos(parsed);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // default: bottom-right small offset
    const defaultX = window.innerWidth - size - 18;
    const defaultY = window.innerHeight - size - 18;
    setPos({ x: defaultX, y: defaultY });
  }, []);

  React.useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    function onPointerDown(e: PointerEvent) {
      // Only left button
      if (e.button !== 0) return;
      dragging.current = true;
      moved.current = false;
      try { el!.setPointerCapture(e.pointerId); } catch {}
      const rect = el!.getBoundingClientRect();
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging.current) return;
      moved.current = true;
      const newX = Math.round(e.clientX - dragOffset.current.x);
      const newY = Math.round(e.clientY - dragOffset.current.y);
      // Clamp to viewport
      const clampedX = Math.max(8, Math.min(newX, window.innerWidth - size - 8));
      const clampedY = Math.max(8, Math.min(newY, window.innerHeight - size - 8));
      setPos({ x: clampedX, y: clampedY });
    }

    function onPointerUp(e: PointerEvent) {
      if (!dragging.current) return;
      dragging.current = false;
      try { el!.releasePointerCapture(e.pointerId); } catch {};
      // persist
      if (pos) {
        try { localStorage.setItem(storageKey, JSON.stringify(pos)); } catch {}
      }
    }

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [pos]);

  // Prevent navigation when the user was dragging
  function handleClick(e: React.MouseEvent) {
    if (moved.current) {
      e.preventDefault();
      moved.current = false;
    }
  }

  const style: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto', position: 'fixed' }
    : { left: 18, bottom: 18, position: 'fixed' };

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      aria-label="Join The Bookworm on WhatsApp"
      title="Join The Bookworm on WhatsApp"
      onClick={handleClick}
      ref={elRef}
      style={style}
    >
      <img src="/whatsapp.svg" alt="WhatsApp" width={20} height={20} />
    </a>
  );
}
