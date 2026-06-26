import {
  Icon,
  clients,
  delayStyle,
  reveal,
  SocialGlyph,
  usePageTitle,
} from "./shared";
import { Footer, Header } from "./Chrome";

const aboutHero = "/media/about/about-hero.jpg";

const gallery = [
  { span: "wide", label: "O'WEEK MAY 25", img: "/media/about/oweek-may-25.jpg", alt: "Orientation week May 2025 event photo" },
  { span: "", label: "SONY WORKSHOP", img: "/media/about/sony-workshop.jpg", alt: "Sony camera workshop session" },
  { span: "", label: "SUKMED 24", img: "/media/about/sukmed-24.jpg", alt: "Sukmed 2024 event activities" },
  { span: "wide", label: "KAKI PHOTO 2025", img: "/media/about/kaki-photo-2025.jpg", alt: "Kaki Photo 2025 meetup" },
  { span: "", label: "KEMBARA RAYA 24", img: "/media/about/kembara-raya-24.jpg", alt: "Kembara Raya 2024 road trip" },
  { span: "wide", label: "SEA AWARDS 2024", img: "/media/about/sea-awards-2024.jpg", alt: "SEA Awards 2024 ceremony" },
  { span: "", label: "CYBERGEN 2025", img: "/media/about/cybergen-2025.jpg", alt: "Cybergen 2025 event" },
  { span: "wide", label: "BROTHER & SISTER 2.0", img: "/media/about/brother-sister-2.jpg", alt: "Brother and Sister 2.0 programme" },
  { span: "", label: "BOOTCAMP 2024", img: "/media/about/bootcamp-2024.jpg", alt: "MedTech bootcamp 2024 training" },
  { span: "wide", label: "CULTRA 2024", img: "/media/about/cultra-2024.jpg", alt: "Cultra 2024 cultural festival" },
];

const team = [
  { name: "Norkamar Faridatul Salwa Binti Kamarudin", role: "Manager (ICT Security & Governance)", dept: "Digital Innovation & Technology", img: "/media/team/norkamar-faridatul.jpg", tier: 0 },
  { name: "Ahmad Ilman Hakim Bin Jasmin", role: "President of MedTech", img: "/media/team/ahmad-ilman.jpg", tier: 1 },
  { name: "Ahmad Ashraf Bin Fauzi", role: "Vice President", dept: "Business", img: "/media/team/ahmad-ashraf.jpg", tier: 2 },
  { name: "Aqryf Syah Bin Azrul Syahrin", role: "Vice President", dept: "Development", img: "/media/team/aqryf-syah.jpg", tier: 2 },
  { name: "Nur Hidayah Binti Zakaria", role: "Secretary I", img: "/media/team/nur-hidayah.jpg", tier: 3 },
  { name: "Zafira Agnia Damiat", role: "Secretary II", img: "/media/team/zafira-agnia.jpg", tier: 3 },
  { name: "Muzzammil Ikhwan Bin Rasit", role: "Treasurer I", img: "/media/team/muzzammil-ikhwan.jpg", tier: 3 },
  { name: "Muhammad Zal Hasmi Bin Mat Zaidi", role: "Treasurer II", img: "/media/team/zal-hasmi.jpg", tier: 3 },
];

export default function About() {
  usePageTitle("About — UTP Medtech Club");
  return (
    <div className="app">
      <Header activePath="/about" />
      <AboutContent />
      <Footer />
    </div>
  );
}

function AboutContent() {
  return (
    <>
      {/* About Hero */}
      <section id="about-hero" className="about-hero">
        <div className="about-hero-bg">
          <img src={aboutHero} alt="Camera crew at an event production setup" className="hero-bg-img" />
        </div>
        <div className="container about-hero-content">
          <span className="eyebrow hero-step">ABOUT US</span>
          <h1 className="hero-step">The Core Strength<br />Of The Organization</h1>
          <p className="hero-step">
            We are a student-driven multimedia and event production team from
            Universiti Teknologi PETRONAS. Driven by passion, creativity and
            commitment, we transform ideas into impactful visual experiences
            and deliver excellence in every production.
          </p>
        </div>
      </section>

      {/* Introduction + Gallery masonry */}
      <section className="section about-intro">
        <div className="container">
          <div className="about-masonry">
            <div className="about-card about-intro-card" {...reveal}>
              <span className="eyebrow">About Us</span>
              <h3>Introduction</h3>
              <p>
                We are a passionate group of students united by our love for
                multimedia and event production. Through teamwork, creativity and
                hands-on experience, we continue to grow, learn and deliver
                productions that leave a lasting impact. Every project we take
                on is a step towards excellence and a reflection of who we are.
              </p>
              <p>
                Driven by a shared vision and supported by strong values, we
                strive to create meaningful experiences and memories for every
                client and every audience.
              </p>
              <span className="about-accent-line" />
            </div>

            {gallery.slice(0, 2).map((g, i) => (
              <GalleryCard key={g.label} g={g} i={i + 1} />
            ))}

            <div className="about-card about-philosophy-card" {...reveal} style={delayStyle(120)}>
              <span className="eyebrow">About Us</span>
              <h3>Our Philosophy</h3>
              <p>
                We believe in teamwork, continuous improvement and giving our
                best in every project we handle. We don&rsquo;t just capture
                moments — we create experiences that last and stories that
                connect people to what truly matters.
              </p>
              <span className="about-accent-line" />
            </div>

            {gallery.slice(2).map((g, i) => (
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
            <span className="eyebrow">The people behind the lens</span>
            <h2 className="section-title">OUR TEAM</h2>
          </div>
          <TeamOrgChart />
        </div>
      </section>

      {/* Clients */}
      <section className="about-clients">
        <div className="container" {...reveal}>
          <h3 className="about-clients-title">Our Clients</h3>
          <div className="clients-carousel">
            <button className="clients-arrow" aria-label="Previous" disabled>
              <SocialGlyph paths={Icon.chevronLeft} />
            </button>
            <div className="clients-logos">
              {clients.map((c) => (
                <div className="client-circle" key={c}>
                  <span>{c.slice(0, 2)}</span>
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

function GalleryCard({ g, i }: { g: { span: string; label: string; img: string; alt: string }; i: number }) {
  return (
    <div className={`about-gallery-card ${g.span}`} {...reveal} style={delayStyle(i * 70)}>
      <img src={g.img} alt={g.alt} loading="lazy" className="card-img" />
      <div className="about-gallery-overlay" />
      <div className="about-gallery-accent" />
      <span className="about-gallery-label">{g.label}</span>
    </div>
  );
}

function TeamOrgChart() {
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