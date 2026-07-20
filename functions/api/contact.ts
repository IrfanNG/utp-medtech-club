import { z } from "zod";

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

const MAX_INQUIRY = 4000;
const MAX_REQUEST_TYPES = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ *
 * Validated contact payload
 * ------------------------------------------------------------------ *
 * Server-side schema applied to every POST. honeypot (`website`) and
 * `turnstileToken` are anti-spam controls supplied by the upgraded
 * frontend (M4/M5); they are tolerated-but-ignored by earlier milestones
 * so a partially upgraded frontend keeps working. `attachment` (the bare
 * filename string used before M3) is accepted but never persisted.
 */
export const contactPayloadSchema = z
  .object({
    idempotencyKey: z.string().trim().min(8).max(64),

    fullName: z.string().trim().min(1).max(120),
    email: z.string().trim().toLowerCase().min(3).max(254).regex(EMAIL_RE, "Invalid email"),
    countryCode: z.string().trim().min(1).max(6),
    phoneNumber: z.string().trim().min(4).max(32),

    organisationType: z.enum(["UTP", "External"]),
    organisation: z.string().trim().min(1).max(200),
    project: z.string().trim().min(1).max(200),

    budget: z.string().trim().max(60),
    requestTypes: z.array(z.string().trim().min(1).max(120)).min(1).max(MAX_REQUEST_TYPES),
    requestTypeOther: z.string().trim().max(500).default(""),
    exemption: z.string().trim().max(60).default(""),

    eventDate: z
      .string()
      .trim()
      .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date")
      .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Invalid date"),

    inquiry: z.string().trim().min(1).max(MAX_INQUIRY),
    hearAbout: z.string().trim().min(1).max(120),
    hearAboutOther: z.string().trim().max(500).default(""),
    referral: z.string().trim().max(120).default(""),

    // Honeypot: must be empty for a legit client; bots fill hidden fields.
    website: z.string().max(200).optional().default(""),
    // Turnstile token consumed only when TURNSTILE_SECRET_KEY is set (M4).
    turnstileToken: z.string().max(4096).optional(),
    // Legacy bare filename — kept tolerated so pre-upgrade forms keep
    // submitting; real attachments land with M3 (multipart upload).
    attachment: z.string().max(300).optional(),
  })
  .superRefine((v, ctx) => {
    const hasOther = v.requestTypes.includes("Other");
    if (hasOther && v.requestTypeOther.length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["requestTypeOther"],
        message: "Please specify the other request type.",
      });
    }
    if (!hasOther && v.requestTypeOther.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["requestTypeOther"],
        message: "Unexpected value for requestTypeOther.",
      });
    }
    if (v.hearAbout === "Other" && v.hearAboutOther.length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["hearAboutOther"],
        message: "Please specify where you heard about us.",
      });
    }
    if (v.hearAbout !== "Other" && v.hearAboutOther.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["hearAboutOther"],
        message: "Unexpected value for hearAboutOther.",
      });
    }
    // Exemption is a UTP-only field; silently clear it for External so the
    // row stays internally consistent regardless of what the client sent.
    if (v.organisationType !== "UTP" && v.exemption !== "") {
      ctx.addIssue({
        code: "custom",
        path: ["exemption"],
        message: "Exemption only applies to UTP organisations.",
      });
    }
  });



const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

// Reject absurdly large JSON bodies (real attachments use multipart).
const MAX_JSON_BODY = 64 * 1024;
// Per-email submission cooldown window.
const COOLDOWN_WINDOW_MS = 60_000;
// Attachment limits (mirror the storage bucket config).
const ATTACHMENT_BUCKET = "contact-attachments";
const ATTACHMENT_MAX_BYTES = 3 * 1024 * 1024;
const ATTACHMENT_MIME = "application/pdf";

function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ||
    "unknown"
  );
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function normalizeBudget(raw: string): string {
  if (!raw) return "";
  if (raw.toUpperCase().startsWith("RM")) return raw;
  return `RM ${raw}`;
}

/** Sanitise the client idempotency key into a storage-safe path segment. */
function safeObjectSegment(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "submission";
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteip: string,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip && remoteip !== "unknown") body.set("remoteip", remoteip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

interface ParsedRequest {
  data: z.infer<typeof contactPayloadSchema>;
  attachment: File | null;
}

/** Parse either application/json or multipart/form-data (field `payload` + optional `attachment`). */
async function parseRequest(request: Request): Promise<
  { ok: true; value: ParsedRequest } | { ok: false; status: number; error: string }
> {
  const contentType = (request.headers.get("Content-Type") || "").toLowerCase();

  if (contentType.startsWith("application/json")) {
    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > MAX_JSON_BODY) {
      return { ok: false, status: 413, error: "Request body too large" };
    }
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return { ok: false, status: 400, error: "Invalid JSON body" };
    }
    const parsed = contactPayloadSchema.safeParse(raw);
    if (!parsed.success) return validationError(parsed);
    return { ok: true, value: { data: parsed.data, attachment: null } };
  }

  if (contentType.startsWith("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return { ok: false, status: 400, error: "Invalid multipart body" };
    }
    const payloadField = form.get("payload");
    if (typeof payloadField !== "string") {
      return { ok: false, status: 422, error: "Missing 'payload' form field" };
    }
    let raw: unknown;
    try {
      raw = JSON.parse(payloadField);
    } catch {
      return { ok: false, status: 400, error: "Invalid JSON in 'payload' field" };
    }
    const parsed = contactPayloadSchema.safeParse(raw);
    if (!parsed.success) return validationError(parsed);
    const attachment = form.get("attachment");
    if (attachment instanceof File && attachment.size === 0) {
      // Browsers sometimes send an empty File for an unset file input.
      return { ok: true, value: { data: parsed.data, attachment: null } };
    }
    if (attachment !== null && !(attachment instanceof File)) {
      return { ok: false, status: 422, error: "'attachment' must be a file" };
    }
    return { ok: true, value: { data: parsed.data, attachment: attachment as File | null } };
  }

  return { ok: false, status: 415, error: "Unsupported Media Type" };
}

function validationError(parsed: {
  error: { issues: { path: PropertyKey[]; message: string }[] };
}): { ok: false; status: number; error: string } {
  return {
    ok: false,
    status: 422,
    error: parsed.error.issues
      .map((i) => `${i.path.map(String).join(".") || "_"}: ${i.message}`)
      .join("; "),
  };
}

/** Validate an uploaded attachment (PDF only, size within bucket limit). */
function validateAttachment(file: File): string | null {
  if (file.size > ATTACHMENT_MAX_BYTES) return "File exceeds 3MB limit.";
  const isPdf =
    file.type === ATTACHMENT_MIME || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files are accepted.";
  return null;
}

async function uploadAttachment(
  supabaseUrl: string,
  serviceKey: string,
  idempotencyKey: string,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; status: number; error: string }> {
  const path = `${safeObjectSegment(idempotencyKey)}/${Date.now()}.pdf`;
  const url = `${supabaseUrl}/storage/v1/object/${ATTACHMENT_BUCKET}/${encodeURIComponent(path)}`;
  const upRes = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": ATTACHMENT_MIME,
      "x-upsert": "false",
    },
    body: await file.arrayBuffer(),
  });
  if (!upRes.ok) {
    return { ok: false, status: 502, error: "Failed to store attachment" };
  }
  return { ok: true, path };
}

async function deleteAttachment(supabaseUrl: string, serviceKey: string, path: string): Promise<void> {
  await fetch(
    `${supabaseUrl}/storage/v1/object/${ATTACHMENT_BUCKET}/${encodeURIComponent(path)}`,
    {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    },
  ).catch(() => {});
}

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  if (context.request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const parsedRequest = await parseRequest(context.request);
  if (!parsedRequest.ok) {
    return json({ error: parsedRequest.error }, parsedRequest.status);
  }
  const payload = parsedRequest.value.data;
  const attachment = parsedRequest.value.attachment;

  // Honeypot: silently swallow spam so bots can't distinguish success.
  if (payload.website && payload.website.trim() !== "") {
    return json({ success: true }, 200);
  }

  // Cloudflare Turnstile: enforced only when a secret key is configured, so
  // local dev without the secret keeps working. Missing token -> 400;
  // failed verification -> 403.
  const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!payload.turnstileToken) {
      return json({ error: "Missing captcha token" }, 400);
    }
    const ok = await verifyTurnstile(turnstileSecret, payload.turnstileToken, clientIp(context.request));
    if (!ok) {
      return json({ error: "Captcha verification failed" }, 403);
    }
  }

  if (attachment) {
    const attachmentError = validateAttachment(attachment);
    if (attachmentError) {
      return json({ error: attachmentError }, 422);
    }
  }

  const supabaseUrl = context.env.SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Server not configured for submissions" }, 503);
  }

  const authHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  } as const;

  // ---- Idempotency: if this key already exists, return the cached 200 ----
  // (200 rather than 409 because the client already got a success for it.)
  if (payload.idempotencyKey) {
    const dupRes = await fetch(
      `${supabaseUrl}/rest/v1/contact_submissions?select=id&idempotency_key=eq.${encodeURIComponent(
        payload.idempotencyKey,
      )}&limit=1`,
      { headers: authHeaders },
    );
    if (dupRes.ok) {
      const existing = (await dupRes.json()) as Array<{ id: string }>;
      if (existing.length > 0) {
        return json({ error: "Duplicate submission detected" }, 409);
      }
    }
  }

  // ---- Per-email cooldown: one submission per email per minute ----
  const since = new Date(Date.now() - COOLDOWN_WINDOW_MS).toISOString();
  const cooldownRes = await fetch(
    `${supabaseUrl}/rest/v1/contact_submissions?select=id&email=eq.${encodeURIComponent(
      payload.email,
    )}&created_at=gte.${encodeURIComponent(since)}&limit=1`,
    { headers: authHeaders },
  );
  if (cooldownRes.ok) {
    const recent = (await cooldownRes.json()) as Array<{ id: string }>;
    if (recent.length > 0) {
      return json({ error: "Too many submissions. Please wait a moment and try again." }, 429);
    }
  }

  // ---- Referral code validation (optional but enforced when populated) ----
  let referralOwnerName = "";
  if (payload.referral) {
    const normalizedCode = payload.referral.trim().toLowerCase();
    const refRes = await fetch(
      `${supabaseUrl}/rest/v1/referral_codes?select=code,referrer_name,active&code=eq.${encodeURIComponent(normalizedCode)}&active=eq.true&limit=1`,
      { headers: authHeaders },
    );
    if (!refRes.ok) {
      return json({ error: "Failed to validate referral code" }, 502);
    }
    const matches = (await refRes.json()) as Array<{ code: string; referrer_name: string; active: boolean }>;
    if (matches.length === 0) {
      return json({ error: "Invalid referral code" }, 422);
    }
    referralOwnerName = matches[0].referrer_name;
  }

  const ip = clientIp(context.request);

  // ---- Optional attachment upload (before insert so the row only stores a
  // path once the file is safely in the private bucket) ----
  let attachmentPath: string | null = null;
  if (attachment) {
    const upload = await uploadAttachment(supabaseUrl, serviceKey, payload.idempotencyKey, attachment);
    if (!upload.ok) {
      return json({ error: upload.error }, upload.status);
    }
    attachmentPath = upload.path;
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
    method: "POST",
    headers: { ...authHeaders, Prefer: "return=representation" },
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      phone_area: payload.countryCode,
      phone_number: payload.phoneNumber,
      organisation_type: payload.organisationType,
      organisation: payload.organisation,
      project: payload.project,
      budget: normalizeBudget(payload.budget),
      request_types: payload.requestTypes,
      request_type_other: payload.requestTypeOther,
      exemption: payload.exemption,
      event_date: payload.eventDate,
      inquiry: payload.inquiry,
      hear_about: payload.hearAbout,
      hear_about_other: payload.hearAboutOther,
      referral: payload.referral,
      referral_owner_name: referralOwnerName,
      idempotency_key: payload.idempotencyKey,
      country_code: payload.countryCode,
      attachment_path: attachmentPath,
      form_data: {
        organisationType: payload.organisationType,
        countryCode: payload.countryCode,
        clientIp: ip,
      },
    }),
  });

  if (!insertRes.ok) {
    const errBody = (await insertRes.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
    };
    // 23505 = unique_violation — the idempotency unique index raced us.
    if (errBody.code === "23505") {
      // Clean up the orphaned upload; the winning row owns the file.
      if (attachmentPath) await deleteAttachment(supabaseUrl, serviceKey, attachmentPath);
      return json({ error: "Duplicate submission detected" }, 409);
    }
    if (attachmentPath) await deleteAttachment(supabaseUrl, serviceKey, attachmentPath);
    return json({ error: "Failed to save submission" }, 502);
  }

  return json({ success: true }, 200);
}