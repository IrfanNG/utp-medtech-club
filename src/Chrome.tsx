import { useEffect, useState } from "react";
import {
  delayStyle,
  Icon,
  navLinks,
  services,
  social,
  SocialGlyph,
} from "./shared";

export function Header({ activePath = "/" }: { activePath?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (label: string) => {
    if (label === "About") return activePath === "/about";
    if (label === "Contact") return activePath === "/contact";
    if (label === "Portfolio") return activePath === "/portfolio";
    return false;
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="container header-inner">
        <a href="#/" className="logo">
          <img src="/medtech-logo.avif" alt="UTP Medtech Club" className="logo-img" />
        </a>
        <nav className="nav">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={isActive(l.label) ? "active" : ""}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="header-cta">
          <a href="#/contact" className="btn btn-primary btn-desktop">
            Get a Quote <span className="btn-arrow">→</span>
          </a>
          <button
            className={`burger ${menuOpen ? "open" : ""}`}
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        {navLinks.map((l) => (
          <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}
        <a href="#/contact" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get a Quote</a>
      </div>
    </header>
  );
}

export function SideRail() {
  return (
    <div className="social-rail">
      {social.map((s) => (
        <a key={s.label} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
          <SocialGlyph paths={s.icon} />
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand" data-reveal>
            <div className="logo">
              <img src="/medtech-logo.avif" alt="UTP Medtech Club" className="logo-img" />
            </div>
            <p>
              We are a multimedia and event production team committed to capturing
              moments, creating impact, and delivering excellence.
            </p>
            <div className="footer-socials">
              {social.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
                  <SocialGlyph paths={s.icon} />
                </a>
              ))}
            </div>
          </div>
          <div className="footer-col" data-reveal style={delayStyle(80)}>
            <h4>Quick Links</h4>
            {navLinks.map((l) => (
              <a key={l.label} href={l.href}>{l.label}</a>
            ))}
          </div>
          <div className="footer-col" data-reveal style={delayStyle(160)}>
            <h4>Services</h4>
            {services.map((s) => (
              <a key={s.title} href="#/#services">{s.title}</a>
            ))}
          </div>
          <div className="footer-col" data-reveal style={delayStyle(240)}>
            <h4>Contact</h4>
            <div className="contact-row">
              <div>
                <span className="label">Email</span>
                <a href="mailto:hello@utpmedtech.my">hello@utpmedtech.my</a>
              </div>
              <div>
                <span className="label">Phone</span>
                <a href="tel:+60300000000">+60 3 0000 0000</a>
              </div>
              <div>
                <span className="label">Working Hours</span>
                <span>Mon – Sat · 9am to 7pm</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} UTP Medtech Club. All rights reserved.</span>
          <span>Crafted for cinematic storytelling.</span>
        </div>
      </div>
    </footer>
  );
}

export { Icon };