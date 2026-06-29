import {
  delayStyle,
  reveal,
  usePageTitle,
} from "./shared";
import { Footer, Header, SideRail } from "./Chrome";
import { useCms } from "./cms/CmsContext";
import { useEffect, useState } from "react";
import type { ServiceCard } from "./cms/pageSchemas";

export default function Home() {
  const { settings } = useCms();
  usePageTitle(settings.title);
  return (
    <div className="app">
      <Header activePath="/" />
      <HomeContent />
      <Footer />
    </div>
  );
}

function HomeContent() {
  const { publishedClients, publishedProjects, landingContent, servicesContent } = useCms();
  const featuredProjects = publishedProjects.filter((p) => p.featured).slice(0, 3);
  const cmsClients = publishedClients.map((c) => c.name);
  const visibleServices = servicesContent.services.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const [activeService, setActiveService] = useState<number | null>(null);

  const openService = (i: number) => setActiveService(i);
  const closeService = () => setActiveService(null);

  return (
    <>
      {/* Hero */}
      <section id="home" className="hero">
        <div className="hero-bg">
          <img src={landingContent.hero.image} alt="Camera crew operating professional video equipment on set" className="hero-bg-img" />
        </div>
        <div className="container hero-content">
          <span className="eyebrow hero-step">{landingContent.hero.eyebrow}</span>
          <h1 className="hero-step">{landingContent.hero.title}</h1>
          <p className="hero-step">
            {landingContent.hero.description}
          </p>
          <div className="hero-actions hero-step">
            <a href="#/portfolio" className="btn btn-primary">View Portfolio <span className="btn-arrow">→</span></a>
            <a href="#/contact" className="btn btn-outline">Get a Quote</a>
          </div>
        </div>
        <SideRail />
        <div className="scroll-indicator">
          <span>Scroll</span>
          <span className="line" />
        </div>
      </section>

      {/* Logo strip */}
      <section id="clients" className="logo-strip">
        <div className="container" {...reveal}>
          <p>{landingContent.clientStripHeading}</p>
          <div className="logos">
            {cmsClients.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section service-panels">
        <div className="container">
          <div className="section-head" {...reveal}>
            <span className="eyebrow">{landingContent.servicesEyebrow}</span>
            <h2 className="section-title">{landingContent.servicesHeading}</h2>
          </div>
          <div className="service-panels-list">
            {visibleServices.map((s, i) => (
              <div
                className="service-panel"
                key={s.title}
                role="button"
                tabIndex={0}
                onClick={() => openService(i)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openService(i); } }}
                {...reveal}
                style={delayStyle(i * 100)}
              >
                <div className="panel-number">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="panel-inner">
                  <div className="panel-media">
                    <div className="panel-img-main">
                      <img src={s.images[0]} alt={s.alt} loading="lazy" className="card-img" />
                    </div>
                    <div className="panel-img-sec">
                      <img src={s.images[1]} alt={s.alt} loading="lazy" className="card-img" />
                    </div>
                  </div>
                  <div className="panel-body">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <span className="panel-learn-more">Learn more →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="section" style={{ marginTop: "-20px" }}>
        <div className="container">
          <div className="section-head" {...reveal}>
            <span className="eyebrow">{landingContent.projectsEyebrow}</span>
            <h2 className="section-title">{landingContent.projectsHeading}</h2>
          </div>
          <div className="projects-grid">
            {featuredProjects.map((p, i) => (
              <div className="project-card" key={p.id} {...reveal} style={delayStyle(i * 100)}>
                <img src={p.coverUrl} alt={p.alt} loading="lazy" className="card-img project-img-fill" />
                <div className="project-overlay" />
                <div className="project-info">
                  <div className="project-tag">{p.category}</div>
                  <h3>{p.title}</h3>
                  <a href={`#/portfolio/project/${p.slug}`} className="project-link">
                    View Project <span>→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {landingContent.stats.map((s, i) => (
              <div className="stat" key={s.label} {...reveal} style={delayStyle(i * 80)}>
                <div className="num">{s.num}<span className="plus">{s.plus}</span></div>
                <div className="label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why" className="section">
        <div className="container">
          <div className="why-grid">
            <div className="why-left" {...reveal}>
              <span className="eyebrow">{landingContent.whyEyebrow}</span>
              <h2>{landingContent.whyHeading}</h2>
              <p>
                {landingContent.whyDescription}
              </p>
            </div>
            <div className="why-img" {...reveal} style={delayStyle(120)}>
              <img src={landingContent.whyImage} alt="Camera crew setting up equipment on a production set" loading="lazy" className="card-img" />
            </div>
            <div className="features" {...reveal} style={delayStyle(240)}>
              {landingContent.features.map((f) => (
                <div className="feature" key={f.title}>
                  <span className="dot" />
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ marginTop: "-40px" }}>
        <div className="container">
          <div className="section-head" {...reveal}>
            <span className="eyebrow">{landingContent.testimonialsEyebrow}</span>
            <h2 className="section-title">{landingContent.testimonialsHeading}</h2>
          </div>
          <div className="testimonials-grid">
            {landingContent.testimonials.map((t, i) => (
              <div className="testimonial" key={t.name} {...reveal} style={delayStyle(i * 100)}>
                <span className="quote-mark">&ldquo;</span>
                <p>{t.quote}</p>
                <div className="author">
                  <div className="avatar">{t.initials}</div>
                  <div className="author-info">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-bg">
          <img src={landingContent.cta.image} alt="Concert crowd with stage lighting" loading="lazy" className="card-img" />
        </div>
        <div className="container" {...reveal}>
          <h2>{landingContent.cta.title}</h2>
          <div className="final-cta-actions">
            <a href="#/contact" className="btn btn-primary">Get a Quote <span className="btn-arrow">→</span></a>
            <a href="#/portfolio" className="btn btn-outline">Explore Portfolio</a>
          </div>
        </div>
      </section>

      {/* Service detail modal */}
      {activeService !== null && visibleServices[activeService] && (
        <ServiceModal service={visibleServices[activeService]} onClose={closeService} />
      )}
    </>
  );
}

/* ---------- Service Detail Modal ---------- */

function ServiceModal({ service, onClose }: { service: ServiceCard; onClose: () => void }) {
  useServiceModalEffects(onClose);

  const detailTitle = service.detailTitle || service.title;
  const detailBody = service.detailBody || service.desc;
  const allImages = [...service.images, ...service.detailGallery].filter(Boolean);
  const highlights = service.detailHighlights.filter(Boolean);

  return (
    <div className="service-modal-overlay" onClick={onClose}>
      <div
        className="service-modal"
        role="dialog"
        aria-modal="true"
        aria-label={detailTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="service-modal-close" onClick={onClose} aria-label="Close dialog">
          ×
        </button>

        <div className="service-modal-scroll">
          {allImages.length > 0 && (
            <div className="service-modal-media">
              {allImages.slice(0, 3).map((img, i) => (
                <div className="service-modal-img-wrap" key={i}>
                  <img src={img} alt={`${detailTitle} — image ${i + 1}`} loading="lazy" className="card-img" />
                </div>
              ))}
            </div>
          )}

          <div className="service-modal-body">
            <span className="eyebrow">Service</span>
            <h2>{detailTitle}</h2>

            <div className="service-modal-desc">
              {detailBody.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {highlights.length > 0 && (
              <ul className="service-modal-highlights">
                {highlights.map((h, i) => (
                  <li key={i}>
                    <span className="service-modal-bullet">▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {service.detailVideo && (
              <div className="service-modal-video">
                <a href={service.detailVideo} target="_blank" rel="noreferrer" className="service-modal-video-link">
                  <span className="service-modal-video-play">▷</span>
                  Watch Video
                </a>
              </div>
            )}

            {service.detailCta && (
              <div className="service-modal-actions">
                <a href="#/contact" className="btn btn-primary" onClick={onClose}>
                  {service.detailCta} <span className="btn-arrow">→</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function useServiceModalEffects(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
}
