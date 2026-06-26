import {
  clients,
  ctaImg,
  delayStyle,
  features,
  heroImg,
  projects,
  reveal,
  services,
  stats,
  testimonials,
  whyImg,
  usePageTitle,
} from "./shared";
import { Footer, Header, SideRail } from "./Chrome";

export default function Home() {
  usePageTitle("UTP Medtech Club");
  return (
    <div className="app">
      <Header activePath="/" />
      <HomeContent />
      <Footer />
    </div>
  );
}

function HomeContent() {
  return (
    <>
      {/* Hero */}
      <section id="home" className="hero">
        <div className="hero-bg">
          <img src={heroImg} alt="Camera crew operating professional video equipment on set" className="hero-bg-img" />
        </div>
        <div className="container hero-content">
          <span className="eyebrow hero-step">We Capture. We Create. We Deliver.</span>
          <h1 className="hero-step">Bringing Moments to Life.</h1>
          <p className="hero-step">
            UTP MedTech Crew is a multimedia production studio crafting photography,
            videography, live streaming and end-to-end event solutions for leading
            organizations across Malaysia and beyond.
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
          <p>Trusted by leading organizations</p>
          <div className="logos">
            {clients.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section service-panels">
        <div className="container">
          <div className="section-head" {...reveal}>
            <span className="eyebrow">What we do</span>
            <h2 className="section-title">Our Services</h2>
          </div>
          <div className="service-panels-list">
            {services.map((s, i) => (
              <div className="service-panel" key={s.title} {...reveal} style={delayStyle(i * 100)}>
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
            <span className="eyebrow">Selected work</span>
            <h2 className="section-title">Featured Projects</h2>
          </div>
          <div className="projects-grid">
            {projects.map((p, i) => (
              <div className="project-card" key={p.title} {...reveal} style={delayStyle(i * 100)}>
                <img src={p.img} alt={p.alt} loading="lazy" className="card-img project-img-fill" />
                <div className="project-overlay" />
                <div className="project-info">
                  <div className="project-tag">{p.tag}</div>
                  <h3>{p.title}</h3>
                  <a href="#/portfolio" className="project-link">
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
            {stats.map((s, i) => (
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
              <span className="eyebrow">Why choose us</span>
              <h2>Why Leading Organizations Trust MedTech</h2>
              <p>
                For over two decades we have powered high-stakes productions —
                from leadership summits to national convocations — with a crew
                obsessed with craft and reliability.
              </p>
            </div>
            <div className="why-img" {...reveal} style={delayStyle(120)}>
              <img src={whyImg} alt="Camera crew setting up equipment on a production set" loading="lazy" className="card-img" />
            </div>
            <div className="features" {...reveal} style={delayStyle(240)}>
              {features.map((f) => (
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
            <span className="eyebrow">Client voices</span>
            <h2 className="section-title">Trusted by Clients, Proven by Results</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
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
          <img src={ctaImg} alt="Concert crowd with stage lighting" loading="lazy" className="card-img" />
        </div>
        <div className="container" {...reveal}>
          <h2>Let&rsquo;s Create Something Extraordinary Together.</h2>
          <div className="final-cta-actions">
            <a href="#/contact" className="btn btn-primary">Get a Quote <span className="btn-arrow">→</span></a>
            <a href="#/portfolio" className="btn btn-outline">Explore Portfolio</a>
          </div>
        </div>
      </section>
    </>
  );
}