import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor">
      <path d="M6.94 8.5A1.56 1.56 0 1 1 6.94 5.4a1.56 1.56 0 0 1 0 3.1ZM5.5 9.7h2.9v8.8H5.5V9.7Zm5.1 0h2.8v1.2h.1c.4-.75 1.35-1.55 2.77-1.55 2.96 0 3.51 1.95 3.51 4.48v4.7h-2.9v-4.4c0-1.05-.02-2.4-1.47-2.4-1.47 0-1.69 1.14-1.69 2.32v4.5h-2.9V9.7Z" />
    </svg>
  );
}

const builders = [
  {
    name: "Niwasiima Ashelycole",
    role: "Software Engineer",
    bio: "Passionate about crafting seamless product experiences that make finding textbooks effortless for students.",
    initials: "NA",
    linkedin: "https://www.linkedin.com/in/niwasiima-ashelycole-091698390",
    avatar: "/assets/Niwasiima-Ashelycole.png",
  },
  {
    name: "Egabo Aaron",
    role: "Software Engineer",
    bio: "Driven by building dependable platforms that make academic materials accessible to every learner.",
    initials: "EA",
    linkedin: "https://www.linkedin.com/in/egaboaaron/",
    avatar: "/assets/Egabo-Aaron.png",
  },
  {
    name: "Rwothomio Evans .E.",
    role: "Software Engineer",
    bio: "Focused on creating intuitive digital interfaces that simplify daily studying and book discovery.",
    initials: "RE",
    linkedin: "https://www.linkedin.com/in/rwothomio-evans-e-7948ab398",
    avatar: "/assets/Rwothomio-Evans-E.png",
  },
  {
    name: "Onyango John Steven",
    role: "Software Engineer",
    bio: "Dedicated to streamlining resource access so students can get the exact books they need without delay.",
    initials: "OS",
    linkedin: "https://www.linkedin.com/in/john-steven-onyango-9794a1376",
    avatar: "/assets/Onyango-John-Steven.png",
  },
  {
    name: "Natozo Patience Martha",
    role: "Software Engineer",
    bio: "Passionate about human-centered design that makes educational platforms welcoming and easy to navigate.",
    initials: "NM",
    linkedin: "https://www.linkedin.com/in/martha-natozo-bba5ab395",
    avatar: "/assets/Natozo-Patience-Martha.png",
  },
  {
    name: "Alimpa Anne Hillary",
    role: "Software Engineer",
    bio: "Inspired by creating digital tools that give students confidence and clarity in their learning journeys.",
    initials: "AH",
    linkedin: "https://www.linkedin.com/in/alimpa-hillary-9ab7b53b8",
    avatar: "/assets/Alimpa-Anne-Hillary.png",
  },
];

export default function AboutPage() {
  return (
    <div className="about-shell">
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

      <main className="container about-page">
        <section className="about-section about-team-section">
          <div className="about-team-header">
            <div>
              <div className="about-kicker">Built By</div>
              <h2 className="about-section-title about-team-title">The Bookworm Team</h2>
            </div>
            <p className="about-team-intro">
              Software Engineering students dedicated to simplifying academic resource access.
            </p>
          </div>

          <div className="team-grid">
            {builders.map((builder) => (
              <article key={builder.name} className="builder-card">
                <div className="builder-avatar-wrap">
                  <Image
                    src={builder.avatar}
                    alt={builder.name}
                    width={110}
                    height={110}
                    className="builder-avatar"
                    priority={false}
                  />
                </div>

                <div className="builder-name">{builder.name}</div>
                <div className="builder-role">{builder.role}</div>

                <p className="builder-bio">{builder.bio}</p>

                <a
                  href={builder.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="builder-link"
                  aria-label={`View ${builder.name} LinkedIn profile`}
                >
                  <LinkedInIcon />
                  View LinkedIn
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="about-hero">
          <div className="about-kicker">The Bookworm</div>
          <h1 className="about-heading">About The Bookworm</h1>
          <p className="about-subcopy">
            Academic textbooks in Uganda are often expensive and difficult to centralize in one place.
            The Bookworm was built to give students fast, direct access to specific course unit material
            without the need to hunt across multiple physical stores or purchase entire expensive course packages.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">How to Download a Book</h2>
          <div className="about-step-grid">
            <article className="about-step">
              <span className="step-number">1</span>
              <h3>Search</h3>
              <p>
                Find the exact textbook needed by title, author, or course unit code across engineering,
                programming, business, law, and health disciplines.
              </p>
            </article>

            <article className="about-step">
              <span className="step-number">2</span>
              <h3>Pay Per Book</h3>
              <p>
                Pay for single books seamlessly using local mobile money providers (MTN Mobile Money /
                Airtel Money) with no subscription fees.
              </p>
            </article>

            <article className="about-step">
              <span className="step-number">3</span>
              <h3>Download &amp; Read Instantly</h3>
              <p>
                Access and download files immediately once payment clears without waiting for manual admin approval.
              </p>
            </article>
          </div>
        </section>

        <Link href="/" className="about-footer-link">
          <ArrowLeft size={16} />
          Back to catalog
        </Link>
      </main>
    </div>
  );
}
