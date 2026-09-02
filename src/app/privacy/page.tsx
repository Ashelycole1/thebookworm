import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
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
      <main className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 800 }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 24 }}>Privacy Policy</h1>
        <p style={{ color: "var(--color-ink-muted)", marginBottom: 40, lineHeight: 1.6 }}>
          Last updated: August 2026
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.6 }}>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you make a purchase, create an account, or contact us for support.</p>
          </section>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>2. How We Use Your Information</h2>
            <p>We use the information we collect to process transactions, provide customer support, and improve our services.</p>
          </section>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>3. Information Sharing</h2>
            <p>We do not share your personal information with third parties except as necessary to process payments or comply with the law.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
