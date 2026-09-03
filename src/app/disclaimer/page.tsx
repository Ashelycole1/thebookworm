import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DisclaimerPage() {
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
          <div className="legal-kicker">Important notice</div>
          <h1 className="legal-page-title">Disclaimers</h1>
          <p className="legal-updated">Last updated: August 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-card">
            <h2>1. General Disclaimer</h2>
            <p>The information made available by The Bookworm is for general informational purposes only. While we do our best to maintain accuracy and relevance, we cannot guarantee that all content is complete, error-free, or current at all times.</p>
          </section>

          <section className="legal-card">
            <h2>2. External Links Disclaimer</h2>
            <p>The platform may contain links to third-party websites, publications, or resources. These links are provided for convenience and informational value only. We do not guarantee the accuracy, reliability, safety, or completeness of information on external sites and are not responsible for their content.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
