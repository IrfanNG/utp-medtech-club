import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/* ---------- Icons (line stroke) ---------- */
export const Icon = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),
  youtube: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <polygon points="10,8 16,12 10,16" />
    </>
  ),
  linkedin: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="7" y1="10" x2="7" y2="17" />
      <circle cx="7" cy="6.5" r="1.4" />
      <path d="M11 17v-4.5a2.5 2.5 0 0 1 5 0V17" />
      <line x1="11" y1="10" x2="11" y2="17" />
    </>
  ),

  arrow: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7h4l2-2h6l2 2h4v12H3z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="1" />
      <path d="M16 10l6-3v10l-6-3z" />
    </>
  ),
  tech: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </>
  ),
  stream: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="3" x2="12" y2="6" />
    </>
  ),
  graphic: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </>
  ),
  marketing: (
    <>
      <path d="M3 11l18-7-7 18-3-7-8-4z" />
    </>
  ),
  chevronLeft: (
    <>
      <polyline points="15,4 8,12 15,20" />
    </>
  ),
  chevronRight: (
    <>
      <polyline points="9,4 16,12 9,20" />
    </>
  ),
};

export const navLinks = [
  { label: "Home", href: "#/" },
  { label: "About", href: "#/about" },
  { label: "Services", href: "#/#services" },
  { label: "Portfolio", href: "#/portfolio" },
  { label: "Clients", href: "#/#clients" },
  { label: "Team", href: "#/about#team" },
  { label: "Contact", href: "#/contact" },
];

export const services = [
  { title: "Photography Services", desc: "Coverage for convocation, wedding shoots, events, and campaigns.", img: "/media/photography.jpg", images: ["/media/photography.jpg", "/media/project-1.jpg"], alt: "Close-up of a professional camera lens" },
  { title: "Videography Services", desc: "Storytelling through current-trend video editing, shooting, and full video production.", img: "/media/videography.jpg", images: ["/media/videography.jpg", "/media/hero.jpg"], alt: "Camera operator filming on a cinema camera" },
  { title: "Technical Services", desc: "Event management, venue technical support, halls/venues support, audio/visual/lighting.", img: "/media/technical.jpg", images: ["/media/technical.jpg", "/media/project-2.jpg"], alt: "Audio mixing console and production equipment" },
  { title: "Design Services", desc: "Apparel, posters, logos, banners, lanyards, shirts, and visual identity.", img: "/media/graphic-design.jpg", images: ["/media/graphic-design.jpg", "/media/marketing.jpg"], alt: "Graphic design workstation with screen" },
  { title: "Website Services", desc: "Web design/development, maintenance, optimization, and digital presence.", img: "/media/streaming.jpg", images: ["/media/streaming.jpg", "/media/project-3.jpg"], alt: "Live streaming control desk with monitors" },
];

export const projects = [
  { tag: "Corporate Event", title: "PETRONAS Leadership Excellence Program 2024", img: "/media/project-1.jpg", alt: "Corporate conference audience in an auditorium" },
  { tag: "Convocation", title: "UTP Convocation Ceremony 2024", img: "/media/project-2.jpg", alt: "Graduation ceremony crowd in a hall" },
  { tag: "Awards Night", title: "Yayasan PETRONAS Excellence Awards 2024", img: "/media/project-3.jpg", alt: "Awards night gala audience under stage lights" },
];

export const whyImg = "/media/why-crew.jpg";
export const ctaImg = "/media/cta-crowd.jpg";
export const heroImg = "/media/hero.jpg";

export const testimonials = [
  { quote: "MedTech delivered beyond our expectations. The footage and live stream quality elevated our entire program.", name: "Aishah Rahman", role: "Event Lead, PETRONAS", initials: "AR" },
  { quote: "Professional, reliable and creative. They handled a complex multi-day convocation flawlessly.", name: "Hazwan Ismail", role: "Director, UTP Affairs", initials: "HI" },
  { quote: "From concept to final cut, the crew brought energy and polish to every single frame.", name: "Mei Ling Tan", role: "Brand Manager, MDEC", initials: "ML" },
];

export const clients = ["PETRONAS", "UTP", "TM", "Yayasan PETRONAS", "MIDA", "MDEC"];

export const features = [
  { title: "Professional Crew", desc: "Experienced directors, DPs and operators on every shoot." },
  { title: "Modern Equipment", desc: "Cinema cameras, broadcast switchers & pro audio rig." },
  { title: "Creative Storytelling", desc: "Concept-led narratives that resonate with audiences." },
  { title: "Reliable Execution", desc: "On-time, on-budget delivery with backup redundancy." },
];

export const stats = [
  { num: "500", plus: "+", label: "Events Covered" },
  { num: "100", plus: "+", label: "Clients" },
  { num: "3000", plus: "+", label: "Projects Completed" },
  { num: "25", plus: "+", label: "Years of Experience" },
];

export const social = [
  { icon: Icon.instagram, label: "Instagram", url: "https://instagram.com/utpmedtechclub" },
  { icon: Icon.linkedin, label: "LinkedIn", url: "https://www.linkedin.com/company/utpmedtech/" },
  { icon: Icon.youtube, label: "YouTube", url: "https://youtube.com/@medtechutp?si=j54wIEmyngSjUAKm" },
];

export function SocialGlyph({ paths }: { paths: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  );
}

/* ---------- Scroll reveal hook ---------- */
export function useReveal(dep?: unknown) {
  useEffect(() => {
    const supported = "IntersectionObserver" in window;
    let io: IntersectionObserver | null = null;

    if (supported) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io!.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
    }

    const scan = () => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"),
      );
      if (io) {
        els.forEach((el) => io!.observe(el));
      } else {
        els.forEach((el) => el.classList.add("is-visible"));
      }
    };

    scan();

    /* Pick up elements mounted after async data arrives */
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io?.disconnect();
    };
  }, [dep]);
}

export const reveal = { "data-reveal": "" };
export const delayStyle = (ms: number) => ({ "--delay": `${ms}ms` } as CSSProperties);

/* ---------- Minimal hash router ---------- */
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function parseHash(): { path: string; anchor: string } {
  const h = window.location.hash || "#/";
  const clean = h.startsWith("#") ? h.slice(1) : h;
  if (clean === "" || clean === "/") return { path: "/", anchor: "" };
  const [rest, anchor] = clean.split("#");
  const path = rest?.split("?")[0] ?? "/";
  return { path: path || "/", anchor: anchor || "" };
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

/* ---------- Slug helper ---------- */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
