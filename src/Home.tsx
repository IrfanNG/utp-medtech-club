import {
  ClientTicker,
  delayStyle,
  reveal,
  usePageTitle,
} from "./shared";
import { Footer, Header, SideRail } from "./Chrome";
import { useCms } from "./cms/CmsContext";
import { FeaturedProjectCarousel3D } from "./components/FeaturedProjectCarousel3D";
import { ServiceExpandCard } from "./components/ServiceExpandCard";

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
  const visibleServices = servicesContent.services.filter((s) => s.visible).sort((a, b) => a.order - b.order);

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
      <section id="clients">
        <ClientTicker
          clients={publishedClients}
          heading={landingContent.clientStripHeading}
        />
      </section>

      {/* Services */}
      <section id="services" className="section">
        <div className="container">
          <div className="section-head" {...reveal}>
            <span className="eyebrow">{landingContent.servicesEyebrow}</span>
            <h2 className="section-title">{landingContent.servicesHeading}</h2>
          </div>
          <ServiceExpandCard
            services={visibleServices.map((s) => ({
              title: s.title,
              description: s.desc,
              image: s.images[0],
              alt: s.alt,
            }))}
          />
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="section" style={{ marginTop: "-20px" }}>
        <div className="container">
          <div className="section-head" {...reveal}>
            <span className="eyebrow">{landingContent.projectsEyebrow}</span>
            <h2 className="section-title">{landingContent.projectsHeading}</h2>
          </div>
          <FeaturedProjectCarousel3D
            projects={featuredProjects}
            onSelect={(p) => { window.location.hash = `#/portfolio/project/${p.slug}`; }}
          />
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

    </>
  );
}
