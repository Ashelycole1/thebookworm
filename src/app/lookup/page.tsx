"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, CheckCircle } from "lucide-react";

interface Download {
  title: string;
  author: string;
  url: string;
}

export default function OrderLookupPage() {
  const [phone, setPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloads, setDownloads] = useState<Download[] | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !transactionId.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setError("");
    setLoading(true);
    setDownloads(null);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, transactionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to find order.");
        return;
      }

      setDownloads(data.downloads || []);
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", paddingBottom: 64 }}>
      {/* Simple header */}
      <header className="site-header" style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" className="icon-circle" aria-label="Go back home">
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/logo-icon.png" alt="Logo" width={24} height={24} />
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>The Bookworm</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: "64px auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Find My Books
        </h1>
        <p style={{ color: "var(--color-ink-muted)", marginBottom: 32, lineHeight: 1.6 }}>
          Enter the phone number you used for payment and your Mobile Money Transaction ID to securely recover your download links.
        </p>

        {!downloads ? (
          <form onSubmit={handleLookup} style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", padding: 24, borderRadius: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 8, color: "var(--color-ink-muted)" }}>
                PHONE NUMBER
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712 345 678"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--color-border)", background: "var(--color-bg)", fontSize: "1rem" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 4, color: "var(--color-ink-muted)" }}>
                TRANSACTION ID
              </label>
              <p style={{ fontSize: "0.75rem", color: "var(--color-ink-muted)", marginBottom: 8 }}>
                MTN: Starts with ID (e.g. 235123...). Airtel: Check "Txn Id" in SMS.
              </p>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. NBP12345678"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--color-border)", background: "var(--color-bg)", fontSize: "1rem" }}
              />
            </div>

            {error && (
              <div style={{ padding: "12px", background: "#fdf2f2", color: "#c0392b", borderRadius: 12, fontSize: "0.9rem", fontWeight: 500, marginBottom: 24 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-black"
              style={{ width: "100%", padding: "14px", borderRadius: 999, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
            >
              {loading ? "Searching..." : (
                <>
                  <Search size={16} />
                  Find Order
                </>
              )}
            </button>
          </form>
        ) : (
          <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", padding: 24, borderRadius: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "var(--color-green)", color: "#fff", padding: 8, borderRadius: "50%" }}>
                <CheckCircle size={24} />
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Order Found!</h2>
            </div>
            
            <p style={{ color: "var(--color-ink-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
              Your books are listed below. These links are valid for 15 minutes.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {downloads.map((d, i) => (
                <div key={i} style={{ border: "1px solid var(--color-border)", padding: 16, borderRadius: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>{d.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)", marginBottom: 16 }}>By {d.author}</p>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-black"
                    style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: 8, textDecoration: "none", fontSize: "0.9rem" }}
                  >
                    Download Now
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setDownloads(null);
                setPhone("");
                setTransactionId("");
              }}
              style={{ display: "block", width: "100%", textAlign: "center", marginTop: 24, background: "none", border: "none", color: "var(--color-ink-muted)", fontWeight: 600, cursor: "pointer" }}
            >
              Search Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
