import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DisclaimerPage() {
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
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 24 }}>Disclaimers</h1>
        <p style={{ color: "var(--color-ink-muted)", marginBottom: 40, lineHeight: 1.6 }}>
          Last updated: August 2026
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, lineHeight: 1.6 }}>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>1. General Disclaimer</h2>
            <p>The information provided by The Bookworm on this website is for general informational purposes only. All information on the site is provided in good faith.</p>
          </section>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>2. External Links Disclaimer</h2>
            <p>The site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
