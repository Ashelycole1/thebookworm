"use client";

import React, { useEffect, useRef } from "react";
import { X, Plus, Minus, Check } from "lucide-react";
import { CartLine, Book, CurrencyConfig } from "@/types";
import Cover from "./Cover";
import { formatPrice } from "@/lib/currency";

interface CartDrawerProps {
  open: boolean;
  cart: CartLine[];
  books: Book[];
  onClose: () => void;
  onQtyChange: (id: number, delta: number) => void;
  onToggleChecked: (id: number) => void;
  onCheckout: () => void;
  currency: CurrencyConfig;
}

export default function CartDrawer({
  open,
  cart,
  books,
  onClose,
  onQtyChange,
  onToggleChecked,
  onCheckout,
  currency,
}: CartDrawerProps) {
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus on open
  useEffect(() => {
    if (open) firstFocusRef.current?.focus();
  }, [open]);

  const cartBooks = cart.map((c) => ({
    ...books.find((b) => b.id === c.id)!,
    qty: c.qty,
    checked: c.checked,
  }));

  const selectedTotal = cartBooks
    .filter((b) => b.checked)
    .reduce((sum, b) => sum + b.price * b.qty, 0);

  // Focus trap
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = e.currentTarget;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        "button, input, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((el) => !el.hasAttribute("disabled"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <>
      {/* Scrim */}
      {open && (
        <div
          className="drawer-scrim"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`cart-drawer${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="cart-header">
          <span style={{ fontWeight: 800, fontSize: "1.05rem" }}>YOUR CART</span>
          <button
            ref={firstFocusRef}
            className="icon-circle"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {cartBooks.length === 0 ? (
            <p className="cart-empty">
              Nothing here yet. Pick a book from the shelf.
            </p>
          ) : (
            cartBooks.map((b) => (
              <div key={b.id} className="cart-line">
                {/* Checkbox */}
                <button
                  className={`checkbox${b.checked ? " checked" : ""}`}
                  onClick={() => onToggleChecked(b.id)}
                  aria-label={
                    b.checked
                      ? `Unselect ${b.title} for checkout`
                      : `Select ${b.title} for checkout`
                  }
                  aria-pressed={b.checked}
                >
                  {b.checked && <Check size={12} color="#fff" strokeWidth={3} />}
                </button>

                {/* Thumbnail */}
                <div style={{ width: 42, flexShrink: 0 }}>
                  <Cover book={b} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      lineHeight: 1.25,
                      textTransform: "uppercase",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}
                  >
                    {b.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-green)",
                      marginTop: 3,
                      fontWeight: 700,
                    }}
                  >
                    {formatPrice(b.price, currency)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 8,
                    }}
                  >
                    <button
                      className="step-btn"
                      onClick={() => onQtyChange(b.id, -1)}
                      aria-label={`Decrease quantity of ${b.title}`}
                    >
                      <Minus size={11} />
                    </button>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        minWidth: 14,
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {b.qty}
                    </span>
                    <button
                      className="step-btn"
                      onClick={() => onQtyChange(b.id, 1)}
                      aria-label={`Increase quantity of ${b.title}`}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartBooks.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Selected items</span>
              <span>{formatPrice(selectedTotal, currency)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery</span>
              <span style={{ color: "var(--color-green)", fontWeight: 700 }}>
                Instant, free
              </span>
            </div>
            <div className="cart-total-row">
              <span>TOTAL</span>
              <span style={{ color: "var(--color-green)" }}>
                {formatPrice(selectedTotal, currency)}
              </span>
            </div>
            <button
              className="btn-black"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "0.88rem",
                borderRadius: 999,
                letterSpacing: "0.02em",
              }}
              onClick={onCheckout}
            >
              CHECKOUT
            </button>
          </div>
        )}
      </div>
    </>
  );
}
