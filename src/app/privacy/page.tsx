import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <div className="legal-kicker">Your privacy matters</div>
          <h1 className="legal-page-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: August 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-card">
            <h2>1. Information We Collect</h2>
            <p>We collect the details you provide directly to us, including purchase information, contact details, and support-related communications. This helps us fulfill orders, respond to your questions, and improve the experience on the platform.</p>
          </section>

          <section className="legal-card">
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to process purchases, send download access where applicable, provide customer support, and improve our catalog, services, and site experience. We do not use personal information for unrelated marketing beyond what is necessary and lawful.</p>
          </section>

          <section className="legal-card">
            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share details only when required to complete a transaction, comply with legal requests, or work with trusted service providers who help us operate the platform securely and efficiently.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
