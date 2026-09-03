import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

export default function TermsPage() {
  return (
    <div className="legal-shell">
      <header className="site-header" style={{ padding: "14px 24px" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" className="icon-circle" aria-label="Go back home">
            <ArrowLeft size={18} />
          </Link>
          <Link href="/" style={{ textDecoration: "none", color: "var(--color-ink)", fontWeight: 800, fontSize: "1.2rem" }}>
            The Bookworm
          </Link>
        </div>
      </header>

      <main className="container legal-page">
        <div className="legal-hero">
          <div className="legal-kicker">The Bookworm</div>
          <h1 className="legal-page-title">Terms of Use</h1>
          <p className="legal-updated">Last updated: August 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-card">
            <h2>1. Digital Delivery & No Refunds</h2>
            <p>Due to the digital nature of our products, including instant PDF and EPUB downloads, <strong>all sales are final and non-refundable</strong>. Once a purchase is completed and the file is delivered, refunds are only possible if the product is proven defective, corrupted, or materially different from the description.</p>
          </section>

          <section className="legal-card">
            <h2>2. Mobile Money Payments</h2>
            <p>Payments are processed through secure Mobile Money channels. You are responsible for confirming the correct phone number and transaction details before approval. Your transaction reference acts as your receipt and should be retained in case you need help retrieving your purchase.</p>
          </section>

          <section className="legal-card">
            <h2>3. Personal Use License</h2>
            <p>When you purchase a book from The Bookworm, you receive a limited, non-exclusive license to access and read the material for personal use only. Reselling, redistributing, or publicly sharing digital files is prohibited and may result in loss of access and enforcement action.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
