interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface ContactPayload {
  idempotencyKey: string;
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  organisationType: string;
  organisation: string;
  project: string;
  budget: string;
  requestTypes: string[];
  requestTypeOther: string;
  exemption: string;
  eventDate: string;
  inquiry: string;
  hearAbout: string;
  hearAboutOther: string;
  referral: string;
  attachment?: string;
}

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  let payload: ContactPayload;
  try {
    payload = (await context.request.json()) as ContactPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers,
    });
  }

  /* ---- Insert into Supabase ---- */
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Server not configured for submissions" }), {
      status: 503,
      headers,
    });
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      full_name: payload.fullName,
      email: payload.email,
      phone_area: payload.countryCode,
      phone_number: payload.phoneNumber,
      organisation: payload.organisation,
      project: payload.project,
      budget: payload.budget,
      request_types: payload.requestTypes,
      request_type_other: payload.requestTypeOther,
      exemption: payload.exemption,
      event_date: payload.eventDate,
      inquiry: payload.inquiry,
      hear_about: payload.hearAbout,
      hear_about_other: payload.hearAboutOther,
      referral: payload.referral,
      promo: "",
      form_data: {
        idempotencyKey: payload.idempotencyKey,
        organisationType: payload.organisationType,
        countryCode: payload.countryCode,
      },
    }),
  });

  if (!insertRes.ok) {
    const errBody = (await insertRes.json()) as { message?: string; code?: string };
    if (errBody.code === "23505") {
      return new Response(JSON.stringify({ error: "Duplicate submission detected" }), {
        status: 409,
        headers,
      });
    }
    return new Response(JSON.stringify({ error: "Failed to save submission" }), {
      status: 502,
      headers,
    });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}
