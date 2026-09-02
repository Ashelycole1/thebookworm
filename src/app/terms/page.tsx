import React from "react";
import Header from "@/components/Header";

export default function TermsPage() {
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <header className="site-header" style={{ padding: "14px 24px" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/" style={{ textDecoration: "none", color: "var(--color-ink)", fontWeight: 800, fontSize: "1.2rem" }}>
            The Bookworm
          </a>
        </div>
      </header>
      <main className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 800 }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 24 }}>Terms of Use</h1>
        <p style={{ color: "var(--color-ink-muted)", marginBottom: 40, lineHeight: 1.6 }}>
          Last updated: August 2026
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.6 }}>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>1. Digital Delivery & No Refunds</h2>
            <p>Due to the digital nature of our products (instant PDF/EPUB downloads), <strong>all sales are final and non-refundable</strong>. Once a transaction is completed and the download link is provided, we cannot offer refunds unless the file itself is proven to be defective or corrupted.</p>
          </section>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>2. Mobile Money Payments</h2>
            <p>Payments are processed securely via MTN Mobile Money and Airtel Money. You are responsible for ensuring the correct phone number is used for authorization. Your Mobile Money Transaction ID acts as your receipt and must be used to recover download links if you lose access to them.</p>
          </section>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>3. Personal Use License</h2>
            <p>When you purchase a book from The Bookworm, you are granted a limited, non-exclusive license to download and read the content for personal use only. Reselling, distributing, or sharing the digital files publicly is strictly prohibited and violates our intellectual property rights.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
