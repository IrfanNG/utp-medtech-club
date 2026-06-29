import {
  Icon,
  delayStyle,
  reveal,
  slugify,
  SocialGlyph,
  usePageTitle,
} from "./shared";
import { Footer, Header } from "./Chrome";
import { useCms } from "./cms/CmsContext";
import type { AboutGalleryItem } from "./cms/pageSchemas";

export default function About() {
  const { settings } = useCms();
  usePageTitle(`About — ${settings.title}`);
  return (
    <div className="app">
      <Header activePath="/about" />
      <AboutContent />
      <Footer />
    </div>
  );
}

function AboutContent() {
  const { aboutContent } = useCms();
  return (
    <>
      {/* About Hero */}
      <section id="about-hero" className="about-hero">
        <div className="about-hero-bg">
          <img src={aboutContent.heroImage} alt="Camera crew at an event production setup" className="hero-bg-img" />
        </div>
        <div className="container about-hero-content">
          <span className="eyebrow hero-step">{aboutContent.heroEyebrow}</span>
          <h1 className="hero-step">{aboutContent.heroTitle.split("\n").map((line, i) => (
            <span key={i}>{i > 0 && <br />}{line}</span>
          ))}</h1>
          <p className="hero-step">
            {aboutContent.heroDescription}
          </p>
        </div>
      </section>

      {/* Introduction + Gallery masonry */}
      <section className="section about-intro">
        <div className="container">
          <div className="about-masonry">
            <div className="about-card about-intro-card" {...reveal}>
              <span className="eyebrow">{aboutContent.introEyebrow}</span>
              <h3>{aboutContent.introTitle}</h3>
              {aboutContent.introParagraphs.map((p, i) => <p key={i}>{p}</p>)}
              <span className="about-accent-line" />
            </div>

            {aboutContent.gallery.slice(0, 2).map((g, i) => (
              <GalleryCard key={g.label} g={g} i={i + 1} />
            ))}

            <div className="about-card about-philosophy-card" {...reveal} style={delayStyle(120)}>
              <span className="eyebrow">{aboutContent.philosophyEyebrow}</span>
              <h3>{aboutContent.philosophyTitle}</h3>
              {aboutContent.philosophyParagraphs.map((p, i) => <p key={i}>{p}</p>)}
              <span className="about-accent-line" />
            </div>

            {aboutContent.gallery.slice(2).map((g, i) => (
              <GalleryCard key={g.label} g={g} i={i + 3} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section id="team" className="section about-team">
        <div className="team-grid-bg" />
        <div className="container">
          <div className="section-head about-team-head" {...reveal}>
            <span className="eyebrow">{aboutContent.teamEyebrow}</span>
            <h2 className="section-title">{aboutContent.teamHeading}</h2>
          </div>
          <TeamOrgChart team={aboutContent.team} />
        </div>
      </section>

      {/* Clients */}
      <section className="about-clients">
        <CMSClients />
      </section>
    </>
  );
}

function CMSClients() {
  const { publishedClients } = useCms();
  return (
    <div className="container" {...reveal}>
      <h3 className="about-clients-title">Our Clients</h3>
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
  );
}

function GalleryCard({ g, i }: { g: AboutGalleryItem; i: number }) {
  const slug = g.slug || slugify(g.label);
  return (
    <a href={`#/about/program/${slug}`} className={`about-gallery-card ${g.span}`} {...reveal} style={delayStyle(i * 70)}>
      <img src={g.img} alt={g.alt} loading="lazy" className="card-img" />
      <div className="about-gallery-overlay" />
      <div className="about-gallery-accent" />
      <span className="about-gallery-label">{g.label}</span>
      <span className="about-gallery-arrow">↗</span>
    </a>
  );
}

function TeamOrgChart({ team }: { team: { name: string; role: string; dept: string; img: string; tier: number }[] }) {
  const tiers = [0, 1, 2, 3] as const;
  return (
    <div className="org-chart">
      {tiers.map((t) => (
        <div className={`org-row org-row-${t}`} key={t}>
          {team.filter((m) => m.tier === t).map((m, i) => (
            <div className="member-card" key={m.name} {...reveal} style={delayStyle(i * 90)}>
              <div className="member-img">
                <img src={m.img} alt={m.name} loading="lazy" className="card-img" />
              </div>
              <div className="member-info">
                <h4>{m.name}</h4>
                <span className="member-role">{m.role}</span>
                {m.dept && <span className="member-prog">{m.dept}</span>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Program Detail Page ---------- */

export function ProgramDetail({ slug }: { slug: string }) {
  const { aboutContent, settings } = useCms();
  usePageTitle(`Program — ${settings.title}`);

  const program = aboutContent.gallery.find((g) => {
    const s = g.slug || slugify(g.label);
    return s === slug;
  });

  if (!program) {
    return (
      <div className="app">
        <Header activePath="/about" />
        <section className="section" style={{ textAlign: "center" }}>
          <div className="container">
            <h2 style={{ marginBottom: "16px" }}>Program not found</h2>
            <p style={{ color: "var(--muted)", marginBottom: "32px" }}>
              The program you are looking for does not exist or may have been removed.
            </p>
            <a href="#/about" className="btn btn-primary">← Back to About</a>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const detailTitle = program.detailTitle || program.label;
  const detailBody = program.detailBody;
  const detailGallery = program.detailGallery.filter(Boolean);
  const meta = [
    program.detailCategory,
    program.detailDate,
    program.detailLocation,
  ].filter(Boolean);

  return (
    <div className="app">
      <Header activePath="/about" />

      {/* Hero / cover image */}
      <section className="program-detail-hero">
        <img src={program.img} alt={program.alt} className="program-detail-hero-img" />
        <div className="program-detail-hero-overlay" />
        <div className="container program-detail-hero-content">
          {meta.length > 0 && (
            <div className="program-detail-meta">
              {meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
          <h1 className="hero-step">{detailTitle}</h1>
        </div>
      </section>

      {/* Body */}
      <section className="section program-detail-body">
        <div className="container program-detail-inner">
          <a href="#/about" className="program-detail-back">
            ← Back to About
          </a>

          {detailBody ? (
            <div className="program-detail-text">
              {detailBody.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ) : (
            <p className="program-detail-placeholder">
              Details for this program will be available soon.
            </p>
          )}

          {detailGallery.length > 0 && (
            <div className="program-detail-gallery" {...reveal}>
              <h3 className="program-detail-section-title">Gallery</h3>
              <div className="program-detail-gallery-grid">
                {detailGallery.map((img, i) => (
                  <div className="program-detail-gallery-item" key={i} {...reveal} style={delayStyle(i * 80)}>
                    <img src={img} alt={`${detailTitle} — image ${i + 1}`} loading="lazy" className="card-img" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {program.detailVideo && (
            <div className="program-detail-video" {...reveal}>
              <h3 className="program-detail-section-title">Video</h3>
              <a href={program.detailVideo} target="_blank" rel="noreferrer" className="program-detail-video-link">
                <span className="program-detail-video-play">▷</span>
                Watch Video
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}