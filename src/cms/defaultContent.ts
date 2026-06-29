import type {
  LandingContent,
  AboutContent,
  ServicesContent,
  ContactContent,
} from "./pageSchemas";

/* ================================================================
 * Default page content — mirrors the current hardcoded values
 * so deployment causes no visual change.
 * ================================================================ */

export const defaultLandingContent: LandingContent = {
  hero: {
    eyebrow: "We Capture. We Create. We Deliver.",
    title: "Bringing Moments to Life.",
    description:
      "UTP MedTech Crew is a multimedia production studio crafting photography, videography, live streaming and end-to-end event solutions for leading organizations across Malaysia and beyond.",
    image: "/media/hero.jpg",
  },
  clientStripHeading: "Trusted by leading organizations",
  servicesEyebrow: "What we do",
  servicesHeading: "Our Services",
  projectsEyebrow: "Selected work",
  projectsHeading: "Featured Projects",
  stats: [
    { num: "500", plus: "+", label: "Events Covered" },
    { num: "100", plus: "+", label: "Clients" },
    { num: "3000", plus: "+", label: "Projects Completed" },
    { num: "25", plus: "+", label: "Years of Experience" },
  ],
  whyEyebrow: "Why choose us",
  whyHeading: "Why Leading Organizations Trust MedTech",
  whyDescription:
    "For over two decades we have powered high-stakes productions — from leadership summits to national convocations — with a crew obsessed with craft and reliability.",
  whyImage: "/media/why-crew.jpg",
  features: [
    { title: "Professional Crew", desc: "Experienced directors, DPs and operators on every shoot." },
    { title: "Modern Equipment", desc: "Cinema cameras, broadcast switchers & pro audio rig." },
    { title: "Creative Storytelling", desc: "Concept-led narratives that resonate with audiences." },
    { title: "Reliable Execution", desc: "On-time, on-budget delivery with backup redundancy." },
  ],
  testimonialsEyebrow: "Client voices",
  testimonialsHeading: "Trusted by Clients, Proven by Results",
  testimonials: [
    { quote: "MedTech delivered beyond our expectations. The footage and live stream quality elevated our entire program.", name: "Aishah Rahman", role: "Event Lead, PETRONAS", initials: "AR" },
    { quote: "Professional, reliable and creative. They handled a complex multi-day convocation flawlessly.", name: "Hazwan Ismail", role: "Director, UTP Affairs", initials: "HI" },
    { quote: "From concept to final cut, the crew brought energy and polish to every single frame.", name: "Mei Ling Tan", role: "Brand Manager, MDEC", initials: "ML" },
  ],
  cta: {
    title: "Let\u2019s Create Something Extraordinary Together.",
    image: "/media/cta-crowd.jpg",
  },
};

export const defaultAboutContent: AboutContent = {
  heroEyebrow: "ABOUT US",
  heroTitle: "The Core Strength\nOf The Organization",
  heroDescription:
    "We are a student-driven multimedia and event production team from Universiti Teknologi PETRONAS. Driven by passion, creativity and commitment, we transform ideas into impactful visual experiences and deliver excellence in every production.",
  heroImage: "/media/about/about-hero.jpg",
  introEyebrow: "About Us",
  introTitle: "Introduction",
  introParagraphs: [
    "We are a passionate group of students united by our love for multimedia and event production. Through teamwork, creativity and hands-on experience, we continue to grow, learn and deliver productions that leave a lasting impact. Every project we take on is a step towards excellence and a reflection of who we are.",
    "Driven by a shared vision and supported by strong values, we strive to create meaningful experiences and memories for every client and every audience.",
  ],
  philosophyEyebrow: "About Us",
  philosophyTitle: "Our Philosophy",
  philosophyParagraphs: [
    "We believe in teamwork, continuous improvement and giving our best in every project we handle. We don\u2019t just capture moments — we create experiences that last and stories that connect people to what truly matters.",
  ],
  gallery: [
    { span: "wide", label: "O'WEEK MAY 25", img: "/media/about/oweek-may-25.jpg", alt: "Orientation week May 2025 event photo", slug: "oweek-may-25", detailTitle: "O'Week May 2025", detailBody: "Orientation Week (O'Week) is our annual welcoming event for new MedTech members. Over several days of activities, ice-breakers and workshops, new recruits get to know the team, learn the basics of multimedia production, and bond with fellow creatives.", detailGallery: ["/media/about/oweek-may-25.jpg", "/media/about/bootcamp-2024.jpg"], detailVideo: "", detailCategory: "Community", detailDate: "May 2025", detailLocation: "UTP Campus" },
    { span: "", label: "SONY WORKSHOP", img: "/media/about/sony-workshop.jpg", alt: "Sony camera workshop session", slug: "sony-workshop", detailTitle: "Sony Workshop", detailBody: "A hands-on workshop in partnership with Sony, giving our members the opportunity to explore professional-grade camera gear and learn advanced photography and videography techniques from industry experts.", detailGallery: ["/media/about/sony-workshop.jpg"], detailVideo: "", detailCategory: "Workshop", detailDate: "2024", detailLocation: "UTP Campus" },
    { span: "", label: "SUKMED 24", img: "/media/about/sukmed-24.jpg", alt: "Sukmed 2024 event activities", slug: "sukmed-24", detailTitle: "Sukmed 2024", detailBody: "Sukmed is UTP's annual sports and cultural festival. MedTech provided full event coverage including photography, videography and technical support across multiple venues over the multi-day event.", detailGallery: ["/media/about/sukmed-24.jpg"], detailVideo: "", detailCategory: "Festival", detailDate: "2024", detailLocation: "UTP Campus" },
    { span: "wide", label: "KAKI PHOTO 2025", img: "/media/about/kaki-photo-2025.jpg", alt: "Kaki Photo 2025 meetup", slug: "kaki-photo-2025", detailTitle: "Kaki Photo 2025", detailBody: "Kaki Photo is a photography meetup that brings together photography enthusiasts from across the region. Our members participated in photo walks, sharing sessions and a showcase of creative work.", detailGallery: ["/media/about/kaki-photo-2025.jpg"], detailVideo: "", detailCategory: "Community", detailDate: "2025", detailLocation: "Kuala Lumpur" },
    { span: "", label: "KEMBARA RAYA 24", img: "/media/about/kembara-raya-24.jpg", alt: "Kembara Raya 2024 road trip", slug: "kembara-raya-24", detailTitle: "Kembara Raya 2024", detailBody: "A festive road trip capturing the spirit of Hari Raya celebrations. Our crew documented the journey, people and moments along the way, producing a memorable visual story.", detailGallery: ["/media/about/kembara-raya-24.jpg"], detailVideo: "", detailCategory: "Community", detailDate: "2024", detailLocation: "Perak" },
    { span: "wide", label: "SEA AWARDS 2024", img: "/media/about/sea-awards-2024.jpg", alt: "SEA Awards 2024 ceremony", slug: "sea-awards-2024", detailTitle: "SEA Awards 2024", detailBody: "The SEA Awards celebrate excellence and achievement across Southeast Asia. MedTech delivered red carpet coverage, stage photography and a highlight reel for this prestigious awards ceremony.", detailGallery: ["/media/about/sea-awards-2024.jpg"], detailVideo: "", detailCategory: "Awards Night", detailDate: "2024", detailLocation: "Kuala Lumpur" },
    { span: "", label: "CYBERGEN 2025", img: "/media/about/cybergen-2025.jpg", alt: "Cybergen 2025 event", slug: "cybergen-2025", detailTitle: "Cybergen 2025", detailBody: "Cybergen is a technology and innovation event showcasing cutting-edge projects. Our team provided full multimedia coverage and technical support for the event's presentations and exhibitions.", detailGallery: ["/media/about/cybergen-2025.jpg"], detailVideo: "", detailCategory: "Corporate Event", detailDate: "2025", detailLocation: "UTP Campus" },
    { span: "wide", label: "BROTHER & SISTER 2.0", img: "/media/about/brother-sister-2.jpg", alt: "Brother and Sister 2.0 programme", slug: "brother-sister-2", detailTitle: "Brother & Sister 2.0", detailBody: "A mentorship and bonding programme pairing senior and junior members of the club. The event fosters a sense of family and continuity, with team-building activities and shared learning experiences.", detailGallery: ["/media/about/brother-sister-2.jpg"], detailVideo: "", detailCategory: "Community", detailDate: "2025", detailLocation: "UTP Campus" },
    { span: "", label: "BOOTCAMP 2024", img: "/media/about/bootcamp-2024.jpg", alt: "MedTech bootcamp 2024 training", slug: "bootcamp-2024", detailTitle: "Bootcamp 2024", detailBody: "Our annual training bootcamp where new members learn the fundamentals of photography, videography, technical production and design through intensive hands-on sessions led by senior members.", detailGallery: ["/media/about/bootcamp-2024.jpg"], detailVideo: "", detailCategory: "Workshop", detailDate: "2024", detailLocation: "UTP Campus" },
    { span: "wide", label: "CULTRA 2024", img: "/media/about/cultra-2024.jpg", alt: "Cultra 2024 cultural festival", slug: "cultra-2024", detailTitle: "Cultra 2024", detailBody: "Cultra is UTP's vibrant cultural festival celebrating diversity through performances, food and art. MedTech captured the energy of the event with full photography and videography coverage.", detailGallery: ["/media/about/cultra-2024.jpg"], detailVideo: "", detailCategory: "Festival", detailDate: "2024", detailLocation: "UTP Campus" },
  ],
  teamEyebrow: "The people behind the lens",
  teamHeading: "OUR TEAM",
  team: [
    { name: "Norkamar Faridatul Salwa Binti Kamarudin", role: "Manager (ICT Security & Governance)", dept: "Digital Innovation & Technology", img: "/media/team/norkamar-faridatul.jpg", tier: 0 },
    { name: "Ahmad Ilman Hakim Bin Jasmin", role: "President of MedTech", dept: "", img: "/media/team/ahmad-ilman.jpg", tier: 1 },
    { name: "Ahmad Ashraf Bin Fauzi", role: "Vice President", dept: "Business", img: "/media/team/ahmad-ashraf.jpg", tier: 2 },
    { name: "Aqryf Syah Bin Azrul Syahrin", role: "Vice President", dept: "Development", img: "/media/team/aqryf-syah.jpg", tier: 2 },
    { name: "Nur Hidayah Binti Zakaria", role: "Secretary I", dept: "", img: "/media/team/nur-hidayah.jpg", tier: 3 },
    { name: "Zafira Agnia Damiat", role: "Secretary II", dept: "", img: "/media/team/zafira-agnia.jpg", tier: 3 },
    { name: "Muzzammil Ikhwan Bin Rasit", role: "Treasurer I", dept: "", img: "/media/team/muzzammil-ikhwan.jpg", tier: 3 },
    { name: "Muhammad Zal Hasmi Bin Mat Zaidi", role: "Treasurer II", dept: "", img: "/media/team/zal-hasmi.jpg", tier: 3 },
  ],
};

export const defaultServicesContent: ServicesContent = {
  eyebrow: "What we do",
  heading: "Our Services",
  services: [
    { title: "Photography Services", desc: "Coverage for convocation, wedding shoots, events, and campaigns.", images: ["/media/photography.jpg", "/media/project-1.jpg"], alt: "Close-up of a professional camera lens", visible: true, order: 0, detailTitle: "Photography Services", detailBody: "From convocation ceremonies to corporate campaigns and weddings, our photography team delivers crisp, emotive imagery that captures the moment. We handle pre-production planning, on-site direction and post-production editing to ensure every shot tells a story.", detailGallery: ["/media/photography.jpg", "/media/project-1.jpg"], detailHighlights: ["Convocation & graduation coverage", "Corporate event photography", "Wedding & pre-wedding shoots", "Campaign & product photography"], detailCta: "Book a Photography Session", detailVideo: "" },
    { title: "Videography Services", desc: "Storytelling through current-trend video editing, shooting, and full video production.", images: ["/media/videography.jpg", "/media/hero.jpg"], alt: "Camera operator filming on a cinema camera", visible: true, order: 1, detailTitle: "Videography Services", detailBody: "We craft cinematic stories from concept to final cut. Our videography team covers everything from event highlight reels to full documentary productions, using current-trend editing techniques and professional cinema-grade equipment.", detailGallery: ["/media/videography.jpg", "/media/hero.jpg"], detailHighlights: ["Event highlight reels", "Documentary & branded content", "Multi-camera production", "Color grading & motion graphics"], detailCta: "Start Your Video Project", detailVideo: "" },
    { title: "Technical Services", desc: "Event management, venue technical support, halls/venues support, audio/visual/lighting.", images: ["/media/technical.jpg", "/media/project-2.jpg"], alt: "Audio mixing console and production equipment", visible: true, order: 2, detailTitle: "Technical Services", detailBody: "Our technical crew provides end-to-end event support including audio systems, visual displays, stage lighting and venue management. From small seminars to large-scale convocations, we ensure flawless technical execution.", detailGallery: ["/media/technical.jpg", "/media/project-2.jpg"], detailHighlights: ["Audio & sound systems", "Stage & venue lighting", "LED wall & visual displays", "Live event technical management"], detailCta: "Request Technical Support", detailVideo: "" },
    { title: "Design Services", desc: "Apparel, posters, logos, banners, lanyards, shirts, and visual identity.", images: ["/media/graphic-design.jpg", "/media/marketing.jpg"], alt: "Graphic design workstation with screen", visible: true, order: 3, detailTitle: "Design Services", detailBody: "Our design team creates visual identities and marketing collateral that stand out. From apparel and print materials to logos and digital assets, we bring creative concepts to life with a polished, professional finish.", detailGallery: ["/media/graphic-design.jpg", "/media/marketing.jpg"], detailHighlights: ["Logo & brand identity design", "Apparel & merchandise design", "Posters, banners & lanyards", "Digital & social media graphics"], detailCta: "Get a Design Quote", detailVideo: "" },
    { title: "Website Services", desc: "Web design/development, maintenance, optimization, and digital presence.", images: ["/media/streaming.jpg", "/media/project-3.jpg"], alt: "Live streaming control desk with monitors", visible: true, order: 4, detailTitle: "Website Services", detailBody: "We build modern, responsive websites and digital experiences. From design and development to maintenance and optimization, our team helps you establish a strong online presence that performs.", detailGallery: ["/media/streaming.jpg", "/media/project-3.jpg"], detailHighlights: ["Responsive web design & development", "Website maintenance & optimization", "E-commerce & booking platforms", "SEO & digital presence strategy"], detailCta: "Build Your Website", detailVideo: "" },
  ],
};

export const defaultContactContent: ContactContent = {
  heroEyebrow: "CONTACT US",
  heroTitle: "LET\u2019S CREATE\nSOMETHING AMAZING.",
  heroDescription:
    "We are more than happy to hear any comments or inquiries from you. Fill in the form below and our team will get back to you as soon as possible.",
  heroImage: "/media/contact/contact-hero.jpg",
  formTitle: "MEDTECH SERVICE INQUIRY",
  formIntro:
    "We are more than happy to hear any comments or inquiries from you. Should you need more information and assistance from us, feel free to fill in the forms below. You may contact us to book our services for technical crew assistance for events in Universiti Teknologi PETRONAS or even do photo and/or video coverage of your memorable occasions via the form below.",
  mascotImage: "/media/contact/mattek.png",
  successMessage: "Thank you. Your inquiry has been received.",
  fields: {
    fullName: { label: "Full Name", placeholder: "Enter your full name", required: true, enabled: true },
    email: { label: "Email", placeholder: "example@utp.edu.my", required: true, enabled: true },
    organisationType: { label: "Organisation Type", placeholder: "", required: true, enabled: true },
    countryCode: { label: "Country Code", placeholder: "", required: true, enabled: true },
    phone: { label: "Phone Number", placeholder: "012 3456789", required: true, enabled: true },
    organisation: { label: "Organisation", placeholder: "Example: UTP MEDTECH Club / UTP ConvFest", required: true, enabled: true },
    project: { label: "Name of Project", placeholder: "Example: Iftar Perdana, CONVOFest", required: true, enabled: true },
    budget: { label: "Budget Range", placeholder: "Example: 800 - 3000", required: true, enabled: true },
    requestType: { label: "Type of Request", placeholder: "", required: true, enabled: true },
    exemption: { label: "If your event is during weekdays, are exemption letters provided?", placeholder: "", required: false, enabled: true },
    eventDate: { label: "Date of Event / Expected Deadline", placeholder: "", required: true, enabled: true },
    inquiry: { label: "Inquiry", placeholder: "Enter your inquiry here...", required: true, enabled: true },
    attachment: { label: "File attachment", placeholder: "", required: false, enabled: true },
    hearAbout: { label: "Where did you hear about us?", placeholder: "", required: true, enabled: true },
    referral: { label: "Insert your referral code", placeholder: "Referral code (optional)", required: false, enabled: true },
  },
  requestTypes: [
    "Technical - Crew Service",
    "Video - Editing",
    "Photo - Event/Convo",
    "Design - Printings (banner/t-shirt/lanyard)",
    "Technical - Multi Camera Production",
    "Video - Shooting",
    "Design - Digital Posters/Logo",
    "Other",
  ],
  hearAboutOptions: [
    "Instagram",
    "TikTok",
    "LinkedIn",
    "Website",
    "MEDTECH Booth (Hari Kantri/CAVE)",
    "Friends",
    "Other",
  ],
  exemptionOptions: ["Yes", "No", "Not applicable"],
};

export const defaultPageContents = {
  landing: defaultLandingContent,
  about: defaultAboutContent,
  services: defaultServicesContent,
  contact: defaultContactContent,
} as const;
