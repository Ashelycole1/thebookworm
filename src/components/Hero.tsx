"use client";

import { BookOpen, ArrowRight, Download, ShieldCheck, Star } from "lucide-react";
import { useCallback } from "react";

export default function Hero() {
  const handleExplore = useCallback(() => {
    const next = document.querySelector('.section-gap');
    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section className="hero-section" aria-label="Hero">
      <div className="hero-bg">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-pill">Your knowledge hub</span>

            <div className="hero-headline-wrap">
              <h2 className="hero-headline-primary">Every book you need.</h2>

              <div className="hero-headline-accent-wrap" style={{ display: 'inline-block', position: 'relative' }}>
                <h2 className="hero-headline-accent">All in one place.</h2>
                <svg className="accent-underline" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: -8, height: 12 }}>
                  <path d="M2 10C50 -2 150 -2 198 10" stroke="#145C2E" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </div>

            <p className="hero-sub">
              Essential resources for students, tech enthusiasts, and lifelong learners.
              <br />
              Pay per book with MTN or Airtel Mobile Money and download instantly.
            </p>

            <div className="hero-ctas">
              <button
                className="btn-cta btn-green"
                onClick={handleExplore}
                aria-label="Explore books"
                style={{ width: '100%', maxWidth: 280 }}
              >
                <BookOpen size={16} />
                <span>Explore Books</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon"><Download size={16} /></span>
                <div>
                  <div className="feature-title">Instant Download</div>
                  <div className="feature-sub">Get your books instantly</div>
                </div>
              </div>

              <div className="feature highlighted">
                <span className="feature-icon"><ShieldCheck size={16} /></span>
                <div>
                  <div className="feature-title">Secure Payment</div>
                  <div className="feature-sub">MTN & Airtel Money</div>
                </div>
              </div>

              <div className="feature">
                <span className="feature-icon"><Star size={16} /></span>
                <div>
                  <div className="feature-title">Quality Resources</div>
                  <div className="feature-sub">Curated for you</div>
                </div>
              </div>
            </div>

            {/* category pills removed from hero (they're rendered by GenreFilter) */}
          </div>

          {/* Illustration removed for a purely textual, centered hero on desktop */}
        </div>
      </div>
    </section>
  );
}
