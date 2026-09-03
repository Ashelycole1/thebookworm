"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, Smartphone } from "lucide-react";
import { CurrencyConfig, Book } from "@/types";
import { formatPrice } from "@/lib/currency";

interface NylonPayModalProps {
  total: number;
  currency: CurrencyConfig;
  cart: { id: string | number; qty: number; checked: boolean }[];
  books: Book[];
  onClose: () => void;
  onSuccess: () => void;
}

type PayStep = "form" | "pending" | "success";

export default function NylonPayModal({
  total,
  currency,
  cart,
  books,
  onClose,
  onSuccess,
}: NylonPayModalProps) {
  const [step, setStep] = useState<PayStep>("form");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [downloads, setDownloads] = useState<{title: string; url: string}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "pending") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, step]);

  function validatePhone(value: string) {
    const cleaned = value.replace(/\s+/g, "");
    if (!cleaned) return "Phone number is required.";
    if (!/^(\+?[\d]{7,15})$/.test(cleaned))
      return "Enter a valid mobile number.";
    return "";
  }

  function handleCancelPayment() {
    if (pollRef.current) clearInterval(pollRef.current);
    setPhoneError("Payment cancelled.");
    setStep("form");
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }
    setPhoneError("");
    setStep("pending");

    try {
      const res = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * currency.rate),
          currency: currency.code,
          phoneNumber: phone,
          cart: cart.map(item => item.id),
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setPhoneError(data.error || "Failed to initiate payment");
        setStep("form");
        return;
      }
      setOrderRef(data.reference);

      // Poll for status every 3 seconds
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/checkout/status?reference=${data.reference}`);
          const statusData = await statusRes.json();
          
          const currentStatus = (statusData.status || "").toLowerCase();
          if (currentStatus === "success" || currentStatus === "successful") {
            if (pollRef.current) clearInterval(pollRef.current);
            
            // Fetch download links
            const fetchedUrls = [];
            for (const item of cart) {
              const book = books.find(b => b.id === item.id);
              if (!book) continue;
              try {
                const dRes = await fetch("/api/download", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ transactionId: data.reference, bookId: item.id })
                });
                if (dRes.ok) {
                  const dData = await dRes.json();
                  if (dData.downloadUrl) {
                    fetchedUrls.push({ title: book.title, url: dData.downloadUrl });
                  }
                }
              } catch (e) {
                console.error("Failed to fetch download link for", book.title, e);
              }
            }
            setDownloads(fetchedUrls);
            setStep("success");
            // Do NOT auto-close, let user download their books and click Done.
          } else if (currentStatus === "failed" || currentStatus === "error") {
            if (pollRef.current) clearInterval(pollRef.current);
            setPhoneError("Payment failed or was cancelled by provider.");
            setStep("form");
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);

    } catch {
      setPhoneError("Network error. Please try again.");
      setStep("form");
    }
  }

  return (
    <div className="modal-scrim" onClick={step === "pending" ? undefined : onClose}>
      <div
        className="modal-panel nylon-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Nylon Pay checkout"
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                letterSpacing: "-0.01em",
              }}
            >
              Mobile Money
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--color-ink-muted)",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              Powered by Nylon Pay
            </div>
          </div>
          <button className="icon-circle" onClick={onClose} aria-label="Close payment">
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Amount */}
        <div className="nylon-amount-box">
          <div className="meta-label" style={{ marginBottom: 4 }}>
            AMOUNT DUE
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "2rem",
              color: "var(--color-green)",
              lineHeight: 1,
            }}
          >
            {formatPrice(total, currency)}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--color-ink-muted)",
              fontWeight: 500,
              marginTop: 6,
            }}
          >
            Digital books · Instant delivery
          </div>
        </div>

        {/* Steps */}
        {step === "form" && (
          <form onSubmit={handlePay} noValidate>
            <div style={{ marginTop: 24 }}>
              <label
                htmlFor="nylon-phone"
                className="meta-label"
                style={{ display: "block", marginBottom: 8 }}
              >
                MOBILE NUMBER
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--color-card-alt)",
                  border: `1.5px solid ${phoneError ? "#C0392B" : "var(--color-border)"}`,
                  borderRadius: 14,
                  padding: "12px 16px",
                }}
              >
                <Smartphone size={16} color="var(--color-ink-muted)" />
                <input
                  ref={inputRef}
                  id="nylon-phone"
                  type="tel"
                  className="search-input"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  placeholder="e.g. 0712 345 678"
                  style={{ width: "100%", fontSize: "0.95rem" }}
                  aria-describedby={phoneError ? "nylon-phone-error" : undefined}
                />
              </div>
              {phoneError && (
                <p
                  id="nylon-phone-error"
                  role="alert"
                  style={{
                    color: "#C0392B",
                    fontSize: "0.78rem",
                    marginTop: 6,
                    fontWeight: 600,
                  }}
                >
                  {phoneError}
                </p>
              )}
              <p
                style={{
                  fontSize: "0.76rem",
                  color: "var(--color-ink-muted)",
                  marginTop: 8,
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                You&apos;ll receive a mobile money prompt on this number. Confirm
                it on your phone to complete the payment.
              </p>
            </div>

            <button
              type="submit"
              className="btn-black"
              style={{
                width: "100%",
                padding: "15px",
                fontSize: "0.9rem",
                borderRadius: 999,
                marginTop: 20,
                letterSpacing: "0.03em",
              }}
            >
              PAY NOW
            </button>
          </form>
        )}

        {step === "pending" && (
          <div className="nylon-status-box">
            <div className="nylon-spinner" aria-label="Awaiting payment" />
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                marginTop: 16,
              }}
            >
              Awaiting mobile money prompt…
            </div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--color-ink-muted)",
                marginTop: 8,
                maxWidth: 260,
                lineHeight: 1.55,
                fontWeight: 500,
              }}
            >
              Check your phone for the payment request and enter your PIN to confirm. (This may take up to 30 seconds depending on your network provider).
            </p>
            <button
              onClick={handleCancelPayment}
              className="meta-label"
              style={{
                background: "none",
                border: "none",
                color: "var(--color-ink-muted)",
                marginTop: 24,
                cursor: "pointer",
                padding: "8px 16px",
              }}
            >
              CANCEL PAYMENT
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="nylon-status-box">
            <div className="nylon-success-icon">
              <Check size={28} color="#fff" strokeWidth={3} />
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                marginTop: 16,
              }}
            >
              Payment confirmed!
            </div>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--color-ink-muted)",
                marginTop: 8,
                lineHeight: 1.55,
                fontWeight: 500,
              }}
            >
              Your books are ready. Click below to download them directly. These links will expire in 15 minutes.
            </p>
            
            {orderRef && (
              <div style={{ marginTop: 12, padding: "8px 12px", background: "var(--color-card-alt)", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ color: "var(--color-ink-muted)", fontWeight: 600, display: "block", fontSize: "0.75rem", marginBottom: 2 }}>ORDER REFERENCE</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{orderRef}</span>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(orderRef)}
                  style={{ background: "none", border: "none", color: "var(--color-ink-muted)", cursor: "pointer", textDecoration: "underline", fontSize: "0.75rem" }}
                >
                  Copy
                </button>
              </div>
            )}

            <div style={{ width: "100%", marginTop: 24, textAlign: "left" }}>
              {downloads.length > 0 ? (
                downloads.map((d, i) => (
                  <a
                    key={i}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn-black"
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "12px",
                      fontSize: "0.85rem",
                      borderRadius: 12,
                      marginBottom: 10,
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    Download "{d.title}"
                  </a>
                ))
              ) : (
                <p style={{ fontSize: "0.82rem", color: "#C0392B", textAlign: "center", marginBottom: 12 }}>
                  Failed to fetch some download links. Please contact support.
                </p>
              )}
              
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="meta-label"
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: "var(--color-ink-muted)",
                  marginTop: 12,
                  cursor: "pointer",
                  padding: "8px",
                  textAlign: "center"
                }}
              >
                DONE
              </button>

              <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
                <p style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)", marginBottom: 8 }}>Payment issue?</p>
                <a 
                  href={process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://chat.whatsapp.com/your-community-code"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: "var(--color-ink)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: "0.85rem" }}
                >
                  <img src="/whatsapp.svg" alt="WhatsApp" width={16} height={16} />
                  Message us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
