import { useMemo, useState } from "react";
import {
  ClientTicker,
  delayStyle,
  reveal,
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
  const { publishedProjects, publishedClients, loading } = useCms();
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

  const featuredProject = useMemo(
    () => publishedProjects.find((p) => p.featured) ?? publishedProjects[0] ?? null,
    [publishedProjects],
  );

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
          {loading ? (
            <div className="featured-card featured-skeleton">
              <div className="featured-img skeleton-block" />
              <div className="featured-body">
                <div className="skeleton-bar skeleton-bar-sm" />
                <div className="skeleton-bar skeleton-bar-xl" />
                <div className="skeleton-bar skeleton-bar-md" />
                <div className="skeleton-bar skeleton-bar-lg" />
                <div className="skeleton-bar skeleton-bar-btn" />
              </div>
            </div>
          ) : featuredProject ? (
            <div className="featured-card">
              <div className="featured-img">
                <img src={featuredProject.coverUrl} alt={featuredProject.alt} loading="lazy" className="card-img" />
                <div className="featured-overlay" />
                <div className="featured-slider-meta">
                  <span>FEATURED</span>
                </div>
              </div>
              <div className="featured-body">
                <span className="featured-label">FEATURED PROJECT</span>
                <h2>{featuredProject.title}</h2>
                <div className="featured-meta">
                  <span>{featuredProject.category}</span>
                  <span>{featuredProject.year}</span>
                  {featuredProject.location && <span>{featuredProject.location}</span>}
                </div>
                <p>{featuredProject.shortDesc || featuredProject.fullDesc}</p>
                <a href={`#/portfolio/project/${featuredProject.slug}`} className="btn btn-primary">VIEW CASE STUDY →</a>
              </div>
            </div>
          ) : (
            <div className="featured-empty">
              <p>No featured project available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* All Projects Grid */}
      <section className="portfolio-grid-section">
        <div className="container">
          <div className="section-head" {...reveal}>
            <span className="eyebrow">All Projects</span>
            <h2 className="section-title">PROJECT GALLERY</h2>
          </div>
          {loading ? (
            <div className="portfolio-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="pfolio-card pfolio-skeleton" key={i}>
                  <div className="pfolio-card-img skeleton-block" />
                  <div className="pfolio-card-body">
                    <div className="skeleton-bar skeleton-bar-sm" />
                    <div className="skeleton-bar skeleton-bar-md" />
                    <div className="skeleton-bar skeleton-bar-xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="no-results">No projects found.</p>
          ) : (
            <div className="portfolio-grid">
              {filtered.map((p, i) => (
                <a href={`#/portfolio/project/${p.slug}`} className="pfolio-card" key={p.id} {...reveal} style={delayStyle(i * 80)}>
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
                </a>
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
        <ClientTicker clients={publishedClients} heading="OUR CLIENTS" />
      </section>
    </>
  );
}

/* ---------- Project Detail Page ---------- */

export function ProjectDetail({ slug }: { slug: string }) {
  const { publishedProjects, settings, loading } = useCms();
  usePageTitle(`Project — ${settings.title}`);

  const project = publishedProjects.find((p) => p.slug === slug);

  if (loading) {
    return (
      <div className="app">
        <Header activePath="/portfolio" />
        <section className="section project-detail-body">
          <div className="container project-detail-inner">
            <div className="featured-card featured-skeleton">
              <div className="featured-img skeleton-block" />
              <div className="featured-body">
                <div className="skeleton-bar skeleton-bar-sm" />
                <div className="skeleton-bar skeleton-bar-xl" />
                <div className="skeleton-bar skeleton-bar-lg" />
                <div className="skeleton-bar skeleton-bar-lg" />
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="app">
        <Header activePath="/portfolio" />
        <section className="section" style={{ textAlign: "center" }}>
          <div className="container">
            <h2 style={{ marginBottom: "16px" }}>Project not found</h2>
            <p style={{ color: "var(--muted)", marginBottom: "32px" }}>
              The project you are looking for does not exist or may have been removed.
            </p>
            <a href="#/portfolio" className="btn btn-primary">← Back to Portfolio</a>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const meta = [project.category, project.year, project.location].filter(Boolean);
  const body = project.fullDesc || project.shortDesc;
  const related = publishedProjects.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="app">
      <Header activePath="/portfolio" />

      {/* Hero / cover image */}
      <section className="project-detail-hero">
        <img src={project.coverUrl} alt={project.alt} className="project-detail-hero-img" />
        <div className="project-detail-hero-overlay" />
        <div className="container project-detail-hero-content">
          {meta.length > 0 && (
            <div className="project-detail-meta">
              {meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
          <h1 className="hero-step">{project.title}</h1>
          {project.shortDesc && (
            <p className="project-detail-hero-desc hero-step">{project.shortDesc}</p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="section project-detail-body">
        <div className="container project-detail-inner">
          <a href="#/portfolio" className="project-detail-back">
            ← Back to Portfolio
          </a>

          {body ? (
            <div className="project-detail-text">
              {body.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ) : (
            <p className="project-detail-placeholder">
              Details for this project will be available soon.
            </p>
          )}

          {/* Placeholder: media/gallery block */}
          <div className="project-detail-placeholder-section" {...reveal}>
            <h3 className="project-detail-section-title">Gallery</h3>
            <div className="project-detail-gallery-grid">
              <div className="project-detail-gallery-item project-detail-placeholder-tile">
                <span>Media coming soon</span>
              </div>
              <div className="project-detail-gallery-item project-detail-placeholder-tile">
                <span>Media coming soon</span>
              </div>
              <div className="project-detail-gallery-item project-detail-placeholder-tile">
                <span>Media coming soon</span>
              </div>
            </div>
          </div>

          {/* Placeholder: video/showcase block */}
          <div className="project-detail-placeholder-section" {...reveal}>
            <h3 className="project-detail-section-title">Video Showcase</h3>
            <div className="project-detail-video-placeholder">
              <span className="project-detail-video-play">▷</span>
              <span>Video showcase coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Related projects */}
      {related.length > 0 && (
        <section className="section project-detail-related">
          <div className="container">
            <div className="section-head" {...reveal}>
              <span className="eyebrow">More work</span>
              <h2 className="section-title">Related Projects</h2>
            </div>
            <div className="portfolio-grid">
              {related.map((p, i) => (
                <a href={`#/portfolio/project/${p.slug}`} className="pfolio-card" key={p.id} {...reveal} style={delayStyle(i * 80)}>
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
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}