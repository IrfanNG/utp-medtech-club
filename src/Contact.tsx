import { cloneElement, isValidElement, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ClientTicker,
  delayStyle,
  reveal,
  usePageTitle,
} from "./shared";
import { Footer, Header } from "./Chrome";
import { useCms } from "./cms/CmsContext";
import { Turnstile } from "./Turnstile";

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) || "";

const COUNTRY_CODES = [
  { value: "+60", label: "Malaysia (+60)" },
  { value: "+65", label: "Singapore (+65)" },
  { value: "+62", label: "Indonesia (+62)" },
  { value: "+673", label: "Brunei (+673)" },
  { value: "+66", label: "Thailand (+66)" },
  { value: "+1", label: "United States (+1)" },
  { value: "+44", label: "United Kingdom (+44)" },
  { value: "+91", label: "India (+91)" },
  { value: "+61", label: "Australia (+61)" },
];

const IDEMPOTENCY_KEY = "mtc.pendingIdempotencyKey";

function getOrCreateIdempotencyKey(): string {
  try {
    const existing = sessionStorage.getItem(IDEMPOTENCY_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(IDEMPOTENCY_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

function clearIdempotencyKey(): void {
  try {
    sessionStorage.removeItem(IDEMPOTENCY_KEY);
  } catch {
    /* ignore */
  }
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
  const { contactContent } = useCms();
  const feedbackAnchorRef = useRef<HTMLDivElement | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [organisationType, setOrganisationType] = useState("UTP");
  const [requestTypeSelection, setRequestTypeSelection] = useState<string[]>([]);
  const [hearOtherOpen, setHearOtherOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const turnstileEnabled = !!TURNSTILE_SITE_KEY;
  const turnstileReady = !turnstileEnabled || !!turnstileToken;
  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileReset((n) => n + 1);
  };

  useEffect(() => {
    if ((!submitted && !submitError) || !feedbackAnchorRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      feedbackAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [submitted, submitError]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (turnstileEnabled && !turnstileToken) {
      setSubmitError("Please complete the captcha above before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData(form);
      const idempotencyKey = getOrCreateIdempotencyKey();
      const requestTypes = formData.getAll("requestType").map(String);
      const requestHasOther = requestTypes.includes("Other");
      const rawBudget = String(formData.get("budget") || "").trim();
      const normalizedBudget = rawBudget ? (rawBudget.toUpperCase().startsWith("RM") ? rawBudget : `RM ${rawBudget}`) : "";

      const body: Record<string, unknown> = {
        idempotencyKey,
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        countryCode: formData.get("countryCode"),
        phoneNumber: formData.get("phoneNumber"),
        organisationType: formData.get("organisationType"),
        organisation: formData.get("organisation"),
        project: formData.get("project"),
        budget: normalizedBudget,
        requestTypes,
        requestTypeOther: requestHasOther ? formData.get("requestTypeOther") || "" : "",
        exemption: String(formData.get("organisationType")) === "UTP" ? formData.get("exemption") || "" : "",
        eventDate: formData.get("eventDate"),
        inquiry: formData.get("inquiry"),
        hearAbout: formData.get("hearAbout"),
        hearAboutOther: formData.get("hearAboutOther") || "",
        referral: formData.get("referral") || "",
        website: formData.get("website") || "",
        turnstileToken: turnstileToken || "",
      };

      const file = (form.querySelector('[name="attachment"]') as HTMLInputElement)?.files?.[0];

      let res: Response;
      if (file) {
        // Real attachment: send multipart with the JSON payload in a `payload`
        // field and the file in an `attachment` field. The server uploads the
        // file to the private contact-attachments bucket and stores its path.
        const multipart = new FormData();
        multipart.set("payload", JSON.stringify(body));
        multipart.set("attachment", file);
        res = await fetch("/api/contact", { method: "POST", body: multipart });
      } else {
        res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errBody = (await res.json()) as { error?: string };
        setSubmitError(errBody.error || `Submission failed (${res.status})`);
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      form.reset();
      setOrganisationType("UTP");
      setRequestTypeSelection([]);
      setHearOtherOpen(false);
      setFileName("");
      clearIdempotencyKey();
      resetTurnstile();
      window.setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
      resetTurnstile();
    }
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

  const requestHasOther = requestTypeSelection.includes("Other");

  return (
    <>
      {/* Contact Hero */}
      <section className="contact-hero">
        <img
          src={contactContent.heroImage}
          alt="MedTech production workstation with studio equipment"
          className="contact-hero-bg"
        />
        <div className="contact-hero-overlay" />
        <div className="container contact-hero-content">
          <span className="eyebrow hero-step">{contactContent.heroEyebrow}</span>
          <h1 className="hero-step">
            {contactContent.heroTitle.split("\n").map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h1>
          <p className="hero-step">
            {contactContent.heroDescription}
          </p>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="section contact-form-section">
        <div className="container">
          <div className="inquiry-card" {...reveal}>
            <div className="inquiry-card-head">
              <div className="inquiry-head-text">
                <h2>{contactContent.formTitle}</h2>
                <p>
                  {contactContent.formIntro}
                </p>
              </div>
              <div className="inquiry-mascot">
                <img src={contactContent.mascotImage} alt="MATTEK mascot" loading="lazy" />
              </div>
            </div>

            <div ref={feedbackAnchorRef} className="form-feedback-anchor" />

            {submitted && (
              <div className="form-success" role="alert">
                {contactContent.successMessage}
              </div>
            )}

            {submitError && (
              <div className="form-success" role="alert" style={{ background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}>
                {submitError}
              </div>
            )}

            <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
              {/* Left column */}
              <div className="form-col">
                {contactContent.fields.fullName?.enabled && (
                  <Field label={contactContent.fields.fullName.label} required={contactContent.fields.fullName.required}>
                    <input type="text" name="fullName" placeholder={contactContent.fields.fullName.placeholder} required={contactContent.fields.fullName.required} maxLength={120} />
                  </Field>
                )}

                {contactContent.fields.email?.enabled && (
                  <Field label={contactContent.fields.email.label} required={contactContent.fields.email.required}>
                    <input type="email" name="email" placeholder={contactContent.fields.email.placeholder} required={contactContent.fields.email.required} maxLength={254} />
                  </Field>
                )}

                {contactContent.fields.phone?.enabled && (
                  <Field label={contactContent.fields.phone.label} required={contactContent.fields.phone.required}>
                    <div className="phone-row">
                      {contactContent.fields.countryCode?.enabled !== false && (
                        <select
                          name="countryCode"
                          defaultValue="+60"
                          required={contactContent.fields.countryCode?.required ?? true}
                          aria-label={contactContent.fields.countryCode?.label || "Country code"}
                        >
                          {COUNTRY_CODES.map((code) => (
                            <option key={code.value} value={code.value}>{code.label}</option>
                          ))}
                        </select>
                      )}
                      <input type="tel" name="phoneNumber" placeholder="123456789" inputMode="numeric" required={contactContent.fields.phone.required} aria-label="Phone number" maxLength={32} />
                    </div>
                  </Field>
                )}

                {contactContent.fields.organisationType?.enabled !== false && (
                  <Field label={contactContent.fields.organisationType?.label || "Organisation Type"} required={contactContent.fields.organisationType?.required ?? true}>
                    <div className="radio-row">
                      {["UTP", "External"].map((type) => (
                        <label className="radio-item" key={type}>
                          <input
                            type="radio"
                            name="organisationType"
                            value={type}
                            checked={organisationType === type}
                            required={contactContent.fields.organisationType?.required ?? true}
                            onChange={(e) => setOrganisationType(e.target.value)}
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                )}

                {contactContent.fields.organisation?.enabled && (
                  <Field label={contactContent.fields.organisation.label} required={contactContent.fields.organisation.required}>
                    <input type="text" name="organisation" placeholder={contactContent.fields.organisation.placeholder} required={contactContent.fields.organisation.required} maxLength={200} />
                  </Field>
                )}

                {contactContent.fields.project?.enabled && (
                  <Field label={contactContent.fields.project.label} required={contactContent.fields.project.required}>
                    <input type="text" name="project" placeholder={contactContent.fields.project.placeholder} required={contactContent.fields.project.required} maxLength={200} />
                  </Field>
                )}

                {contactContent.fields.budget?.enabled && (
                  <Field label={contactContent.fields.budget.label} required={contactContent.fields.budget.required}>
                    <div className="money-input">
                      <span>RM</span>
                      <input type="text" name="budget" placeholder={contactContent.fields.budget.placeholder} required={contactContent.fields.budget.required} maxLength={60} />
                    </div>
                  </Field>
                )}

                {contactContent.fields.requestType?.enabled && (
                  <Field label={contactContent.fields.requestType.label} required={contactContent.fields.requestType.required}>
                    <div className="check-grid">
                      {contactContent.requestTypes.map((t) => (
                        <label className="check-item" key={t}>
                          <input
                            type="checkbox"
                            name="requestType"
                            value={t}
                            onChange={(e) => {
                              setRequestTypeSelection((prev) =>
                                e.target.checked ? [...prev, t] : prev.filter((item) => item !== t),
                              );
                            }}
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                    {requestHasOther && (
                      <input type="text" name="requestTypeOther" placeholder="Please specify" className="other-input" required maxLength={500} />
                    )}
                  </Field>
                )}

                {contactContent.fields.exemption?.enabled && organisationType === "UTP" && (
                  <Field label={contactContent.fields.exemption.label}>
                    <div className="radio-row">
                      {contactContent.exemptionOptions.map((o) => (
                        <label className="radio-item" key={o}>
                          <input type="radio" name="exemption" value={o} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                )}

                {contactContent.fields.eventDate?.enabled && (
                  <Field label={contactContent.fields.eventDate.label} required={contactContent.fields.eventDate.required}>
                    <input type="date" name="eventDate" required={contactContent.fields.eventDate.required} />
                  </Field>
                )}
              </div>

              {/* Right column */}
              <div className="form-col">
                {contactContent.fields.inquiry?.enabled && (
                  <Field label={contactContent.fields.inquiry.label} required={contactContent.fields.inquiry.required}>
                    <textarea name="inquiry" rows={6} placeholder={contactContent.fields.inquiry.placeholder} required={contactContent.fields.inquiry.required} maxLength={4000} />
                  </Field>
                )}

                {contactContent.fields.attachment?.enabled && (
                  <Field label={contactContent.fields.attachment.label}>
                    <div className="file-widget">
                      <label className="file-btn">
                        <input type="file" name="attachment" accept=".pdf,application/pdf" onChange={handleFile} />
                        Browse Files
                      </label>
                      {fileName && <span className="file-name">{fileName}</span>}
                    </div>
                    {fileError && <span className="field-error">{fileError}</span>}
                    <span className="helper">Only documents in .pdf format is accepted, and the files shall not exceed 3MB</span>
                  </Field>
                )}

                {contactContent.fields.hearAbout?.enabled && (
                  <Field label={contactContent.fields.hearAbout.label} required={contactContent.fields.hearAbout.required}>
                    <div className="radio-grid">
                      {contactContent.hearAboutOptions.map((o) => (
                        <label className="radio-item" key={o}>
                          <input
                            type="radio"
                            name="hearAbout"
                            value={o}
                            required={contactContent.fields.hearAbout.required}
                            onChange={(e) => setHearOtherOpen(e.target.checked && o === "Other")}
                          />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                    {hearOtherOpen && (
                      <input type="text" name="hearAboutOther" placeholder="Please specify" className="other-input" maxLength={500} />
                    )}
                  </Field>
                )}

                {contactContent.fields.referral?.enabled && (
                  <Field label={contactContent.fields.referral.label}>
                    <input type="text" name="referral" placeholder={contactContent.fields.referral.placeholder} maxLength={120} />
                  </Field>
                )}

                {/* Honeypot: visually hidden, real users never fill it. */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
                  <label>Website (leave blank)</label>
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </div>
              </div>

              <div className="form-submit">
                {turnstileEnabled && (
                  <div className="form-captcha">
                    <Turnstile
                      key={turnstileReset}
                      siteKey={TURNSTILE_SITE_KEY}
                      onToken={setTurnstileToken}
                      onExpire={() => setTurnstileToken("")}
                      onError={() => setTurnstileToken("")}
                    />
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-submit" disabled={submitting || !turnstileReady}>
                  {submitting ? "SUBMITTING…" : "SUBMIT"}
                </button>
                {turnstileEnabled && !turnstileReady && !submitError && (
                  <span className="form-captcha-hint">Complete the captcha above to submit.</span>
                )}
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
    <ClientTicker clients={publishedClients} heading="Our Clients" />
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
