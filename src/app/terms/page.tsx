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
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>1. Acceptance of Terms</h2>
            <p>By accessing and using The Bookworm, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>2. License and Access</h2>
            <p>We grant you a limited license to access and make personal use of this website. You may download purchased books for personal, non-commercial use only.</p>
          </section>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>3. Intellectual Property</h2>
            <p>All content included on this site, such as text, graphics, logos, and digital downloads, is the property of The Bookworm or its content suppliers and protected by international copyright laws.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
