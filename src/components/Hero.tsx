"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 0" }}>
      <div className="hero-grid">
        {/* Left: copy */}
        <div className="hero-copy">
          <h1 className="hero-headline">
            Every book you need.
            <br />
            All in one place.
          </h1>
          <p className="hero-sub">
            Essential resources for students, tech
            enthusiasts, and lifelong learners.
            <br />
            Pay per book with MTN or Airtel
            Mobile Money and download instantly.
          </p>
        </div>

        {/* Right: premium logo card */}
        <div className="hero-logo-wrap">
          <div className="hero-logo-card">
            <div className="hero-logo-glow" />
            <Image
              src="/bookworm-logo.png"
              alt="The Bookworm — Books. Resources. Growth."
              width={320}
              height={320}
              priority
              className="hero-logo-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
