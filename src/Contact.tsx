import { cloneElement, isValidElement, useState, type FormEvent } from "react";
import {
  Icon,
  delayStyle,
  reveal,
  SocialGlyph,
  usePageTitle,
} from "./shared";
import { Footer, Header } from "./Chrome";
import { useCms } from "./cms/CmsContext";

const requestTypes = [
  "Technical - Crew Service",
  "Video - Editing",
  "Photo - Event/Convo",
  "Design - Printings (banner/t-shirt/lanyard)",
  "Technical - Multi Camera Production",
  "Video - Shooting",
  "Design - Digital Posters/Logo",
  "Other",
];

const hearAboutOptions = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Website",
  "MEDTECH Booth (Hari Kantri/CAVE)",
  "Friends",
  "Other",
];

const exemptionOptions = ["Yes", "No", "Not applicable"];

function makeCaptcha(len = 5) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function Contact() {
  const { settings } = useCms();
  usePageTitle(`Contact — ${settings.title}`);
  return (
    <div className="app">
      <Header activePath="/contact" />
      <ContactContent />
      <Footer />
    </div>
  );
}

function ContactContent() {
  const [submitted, setSubmitted] = useState(false);
  const [captcha] = useState(() => makeCaptcha());
  const [otherOpen, setOtherOpen] = useState(false);
  const [hearOtherOpen, setHearOtherOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSubmitted(true);
    form.reset();
    setOtherOpen(false);
    setHearOtherOpen(false);
    setFileName("");
    window.setTimeout(() => setSubmitted(false), 6000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const f = e.target.files?.[0];
    if (!f) {
      setFileName("");
      return;
    }
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Only PDF files are accepted.");
      e.target.value = "";
      setFileName("");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setFileError("File exceeds 3MB limit.");
      e.target.value = "";
      setFileName("");
      return;
    }
    setFileName(f.name);
  };

  return (
    <>
      {/* Contact Hero */}
      <section className="contact-hero">
        <img
          src="/media/contact/contact-hero.jpg"
          alt="MedTech production workstation with studio equipment"
          className="contact-hero-bg"
        />
        <div className="contact-hero-overlay" />
        <div className="container contact-hero-content">
          <span className="eyebrow hero-step">CONTACT US</span>
          <h1 className="hero-step">
            LET&rsquo;S CREATE<br />SOMETHING AMAZING.
          </h1>
          <p className="hero-step">
            We are more than happy to hear any comments or inquiries from you.
            Fill in the form below and our team will get back to you as soon as
            possible.
          </p>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="section contact-form-section">
        <div className="container">
          <div className="inquiry-card" {...reveal}>
            <div className="inquiry-card-head">
              <div className="inquiry-head-text">
                <h2>MEDTECH SERVICE INQUIRY</h2>
                <p>
                  We are more than happy to hear any comments or inquiries from
                  you. Should you need more information and assistance from us,
                  feel free to fill in the forms below. You may contact us to book
                  our services for technical crew assistance for events in
                  Universiti Teknologi PETRONAS or even do photo and/or video
                  coverage of your memorable occasions via the form below.
                </p>
              </div>
              <div className="inquiry-mascot">
                <img src="/media/contact/mattek.png" alt="MATTEK mascot" loading="lazy" />
              </div>
            </div>

            {submitted && (
              <div className="form-success" role="alert">
                Thank you. Your inquiry has been received.
              </div>
            )}

            <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
              {/* Left column */}
              <div className="form-col">
                <Field label="Full Name" required>
                  <input type="text" name="fullName" placeholder="Enter your full name" required />
                </Field>

                <Field label="Email" required>
                  <input type="email" name="email" placeholder="example@utp.edu.my" required />
                </Field>

                <Field label="Phone Number" required>
                  <div className="phone-row">
                    <input type="tel" name="phoneArea" placeholder="012" inputMode="numeric" pattern="[0-9]{2,4}" required aria-label="Phone area code" />
                    <input type="tel" name="phoneNumber" placeholder="3456789" inputMode="numeric" required aria-label="Phone number" />
                  </div>
                </Field>

                <Field label="Organisation" required>
                  <input type="text" name="organisation" placeholder="Example: UTP MEDTECH Club / UTP ConvFest" required />
                </Field>

                <Field label="Name of Project" required>
                  <input type="text" name="project" placeholder="Example: Iftar Perdana, CONVOFest" required />
                </Field>

                <Field label="Budget Range" required>
                  <input type="text" name="budget" placeholder="Example: RM800, RM3k" required />
                </Field>

                <Field label="Type of Request" required>
                  <div className="check-grid">
                    {requestTypes.map((t) => (
                      <label className="check-item" key={t}>
                        <input
                          type="checkbox"
                          name="requestType"
                          value={t}
                          onChange={(e) => setOtherOpen(e.target.checked && t === "Other")}
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                  {otherOpen && (
                    <input type="text" name="requestTypeOther" placeholder="Please specify" className="other-input" />
                  )}
                </Field>

                <Field label="If your event is during weekdays, are exemption letters provided?">
                  <div className="radio-row">
                    {exemptionOptions.map((o) => (
                      <label className="radio-item" key={o}>
                        <input type="radio" name="exemption" value={o} />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Date of Event / Expected Deadline" required>
                  <input type="date" name="eventDate" required />
                </Field>
              </div>

              {/* Right column */}
              <div className="form-col">
                <Field label="Inquiry" required>
                  <textarea name="inquiry" rows={6} placeholder="Enter your inquiry here..." required />
                </Field>

                <Field label="File attachment">
                  <div className="file-widget">
                    <label className="file-btn">
                      <input type="file" accept=".pdf,application/pdf" onChange={handleFile} />
                      Browse Files
                    </label>
                    {fileName && <span className="file-name">{fileName}</span>}
                  </div>
                  {fileError && <span className="field-error">{fileError}</span>}
                  <span className="helper">Only documents in .pdf format is accepted, and the files shall not exceed 3MB</span>
                </Field>

                <Field label="Where did you hear about us?" required>
                  <div className="radio-grid">
                    {hearAboutOptions.map((o) => (
                      <label className="radio-item" key={o}>
                        <input
                          type="radio"
                          name="hearAbout"
                          value={o}
                          required
                          onChange={(e) => setHearOtherOpen(e.target.checked && o === "Other")}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                  {hearOtherOpen && (
                    <input type="text" name="hearAboutOther" placeholder="Please specify" className="other-input" />
                  )}
                </Field>

                <Field label="Insert your referral code">
                  <input type="text" name="referral" placeholder="Referral code (optional)" />
                </Field>

                <Field label="Insert your promo code">
                  <input type="text" name="promo" placeholder="Promo code (optional)" />
                </Field>

                <Field label="Enter the message as it&rsquo;s shown" required>
                  <div className="captcha-row">
                    <span className="captcha-box" aria-hidden="true">{captcha}</span>
                    <input type="text" name="captcha" placeholder="Type the code above" required pattern={captcha} />
                  </div>
                </Field>
              </div>

              <div className="form-submit">
                <button type="submit" className="btn btn-primary btn-submit">SUBMIT</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="about-clients contact-clients">
        <ContactClients />
      </section>
    </>
  );
}

function ContactClients() {
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  const id = label.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const child = isValidElement(children) ? (children as React.ReactElement) : null;
  const isFormControl = !!child && (child.type === "input" || child.type === "textarea" || child.type === "select");
  return (
    <div className="field" style={delayStyle(60)}>
      <label htmlFor={isFormControl ? id : undefined} className="field-label">
        {label} {required && <span className="req">*</span>}
      </label>
      <div className="field-control">
        {isFormControl ? cloneElement(child!, { id, "aria-label": label } as Record<string, unknown>) : children}
      </div>
    </div>
  );
}