import { useMemo, useState } from "react";
import {
  Icon,
  delayStyle,
  reveal,
  SocialGlyph,
  usePageTitle,
} from "./shared";
import { Footer, Header } from "./Chrome";
import { useCms } from "./cms/CmsContext";

const categories = [
  "All Projects",
  "Corporate",
  "Convocation",
  "Workshop",
  "Live Streaming",
  "Festival",
  "Community",
  "Behind The Scenes",
];

const showreelThumbs = [
  { img: "/media/project-1.jpg", alt: "Corporate conference audience" },
  { img: "/media/project-2.jpg", alt: "Graduation ceremony crowd" },
  { img: "/media/project-3.jpg", alt: "Awards night gala" },
];

export default function Portfolio() {
  const { settings } = useCms();
  usePageTitle(`Portfolio — ${settings.title}`);
  return (
    <div className="app">
      <Header activePath="/portfolio" />
      <PortfolioContent />
      <Footer />
    </div>
  );
}

function PortfolioContent() {
  const { publishedProjects, publishedClients } = useCms();
  const [activeFilter, setActiveFilter] = useState("All Projects");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publishedProjects.filter((p) => {
      const catOk = activeFilter === "All Projects" || p.category === activeFilter;
      const qOk =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.year.includes(q);
      return catOk && qOk;
    });
  }, [publishedProjects, activeFilter, query]);

  return (
    <>
      {/* Hero */}
      <section className="portfolio-hero">
        <img src="/media/portfolio/portfolio-hero.jpg" alt="Camera recording a MedTech event stage production" className="portfolio-hero-bg" />
        <div className="portfolio-hero-overlay" />
        <div className="container portfolio-hero-content">
          <span className="eyebrow hero-step">OUR WORK, YOUR IMPACT</span>
          <h1 className="hero-step">PROJECTS</h1>
          <p className="hero-step">
            Every project tells a story. From corporate events to university
            initiatives, we capture moments, create impact, and deliver
            excellence.
          </p>
        </div>
      </section>

      {/* Filters + Search */}
      <section className="portfolio-filters-section">
        <div className="container">
          <div className="portfolio-filters" {...reveal}>
            <div className="filter-buttons">
              {categories.map((c) => (
                <button
                  key={c}
                  className={activeFilter === c ? "filter-btn active" : "filter-btn"}
                  onClick={() => setActiveFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="filter-search">
              <input
                type="text"
                placeholder="Search projects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search projects"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Project */}
      <section className="portfolio-featured">
        <div className="container" {...reveal}>
          <div className="featured-card">
            <div className="featured-img">
              <img src="/media/project-1.jpg" alt="PETRONAS Leadership Excellence Program 2024 conference" loading="lazy" className="card-img" />
              <div className="featured-overlay" />
              <div className="featured-slider-meta">
                <span>01 — 05</span>
                <div className="featured-arrows">
                  <button aria-label="Previous" disabled>‹</button>
                  <button aria-label="Next" disabled>›</button>
                </div>
              </div>
            </div>
            <div className="featured-body">
              <span className="featured-label">FEATURED PROJECT</span>
              <h2>PETRONAS LEADERSHIP EXCELLENCE PROGRAM 2024</h2>
              <div className="featured-meta">
                <span>Corporate Event</span>
                <span>2024</span>
                <span>Kuala Lumpur</span>
              </div>
              <p>
                A leadership development program bringing together participants
                from across PETRONAS for an impactful 3-day experience filled with
                knowledge sharing, networking and team building.
              </p>
              <a href="#/portfolio" className="btn btn-primary">VIEW CASE STUDY →</a>
            </div>
          </div>
        </div>
      </section>

      {/* All Projects Grid */}
      <section className="portfolio-grid-section">
        <div className="container">
          <div className="section-head" {...reveal}>
            <span className="eyebrow">All Projects</span>
            <h2 className="section-title">PROJECT GALLERY</h2>
          </div>
          {filtered.length === 0 ? (
            <p className="no-results">No projects found.</p>
          ) : (
            <div className="portfolio-grid">
              {filtered.map((p, i) => (
                <div className="pfolio-card" key={p.id} {...reveal} style={delayStyle(i * 80)}>
                  <div className="pfolio-card-img">
                    <img src={p.coverUrl} alt={p.alt} loading="lazy" className="card-img" />
                    <div className="pfolio-card-overlay" />
                    <span className="pfolio-card-arrow">↗</span>
                  </div>
                  <div className="pfolio-card-body">
                    <span className="pfolio-card-cat">{p.category}</span>
                    <h3>{p.title}</h3>
                    <span className="pfolio-card-year">{p.year}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="portfolio-load-more" {...reveal}>
            <button className="btn btn-outline" type="button">LOAD MORE PROJECTS</button>
          </div>
        </div>
      </section>

      {/* Showreel */}
      <section className="showreel-section">
        <div className="container showreel-inner" {...reveal}>
          <div className="showreel-text">
            <span className="eyebrow">SHOWREEL</span>
            <h2>
              SEE OUR WORK<br />IN MOTION
            </h2>
            <p>
              A short showcase of moments we&rsquo;ve captured and stories
              we&rsquo;ve brought to life.
            </p>
            <button className="btn btn-primary" type="button">WATCH SHOWREEL ▷</button>
          </div>
          <div className="showreel-thumbs">
            {showreelThumbs.map((t, i) => (
              <div className={i === 1 ? "showreel-thumb showreel-thumb-center" : "showreel-thumb"} key={t.img}>
                <img src={t.img} alt={t.alt} loading="lazy" className="card-img" />
                {i === 1 && (
                  <button className="play-btn" aria-label="Play showreel" type="button">
                    <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="9,7 17,12 9,17" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="about-clients portfolio-clients">
        <div className="container" {...reveal}>
          <h3 className="about-clients-title">OUR CLIENTS</h3>
          <div className="clients-carousel">
            <button className="clients-arrow" aria-label="Previous" disabled>
              <SocialGlyph paths={Icon.chevronLeft} />
            </button>
            <div className="clients-logos">
              {publishedClients.map((c) => (
                <div className="client-circle" key={c.id}>
                  <span>{c.name.slice(0, 2)}</span>
                </div>
              ))}
            </div>
            <button className="clients-arrow" aria-label="Next" disabled>
              <SocialGlyph paths={Icon.chevronRight} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}