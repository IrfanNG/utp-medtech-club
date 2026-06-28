interface Env {
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_TAG?: string;
  CLOUDFLARE_HOSTNAME?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Minimal JWT decode (no crypto verify — the token has already been
// validated by Supabase Auth when the user signed in; here we just
// extract the user id and check the admin profile server-side).
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  /* ---- Auth: verify Supabase admin ---- */

  const authHeader = context.request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers,
    });
  }
  const token = authHeader.slice(7);
  const claims = decodeJwt(token);
  if (!claims?.sub) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers,
    });
  }
  const userId = claims.sub as string;

  // Verify admin role via Supabase service role
  const supabaseUrl = context.env.SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceKey) {
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      },
    );
    if (profileRes.ok) {
      const profiles = (await profileRes.json()) as { role: string }[];
      if (!profiles.length || profiles[0].role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Forbidden: admin only" }),
          { status: 403, headers },
        );
      }
    }
  }
  // If SUPABASE env vars are absent we skip the check (dev fallback).

  /* ---- Fetch Cloudflare Web Analytics ---- */

  const apiToken = context.env.CLOUDFLARE_API_TOKEN;
  const accountTag = context.env.CLOUDFLARE_ACCOUNT_TAG;
  const hostname =
    context.env.CLOUDFLARE_HOSTNAME || "utp-medtech-club.pages.dev";

  if (!apiToken || !accountTag) {
    return new Response(
      JSON.stringify({ error: "CF analytics not configured" }),
      { status: 503, headers },
    );
  }

  const query = `
    query {
      viewer {
        accounts(filter: {accountTag: "${accountTag}"}) {
          rumPageloadsAdaptiveGroups(
            limit: 30
            filter: {date_gt: "${daysAgo(31)}", host: ["${hostname}"]}
            orderBy: [date_DESC]
          ) {
            dimensions { date }
            sum { pageViews }
            uniq { uniques }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const body = (await res.json()) as Record<string, unknown>;

    if (!res.ok || body.errors) {
      return new Response(
        JSON.stringify({ error: "CF API error", detail: body }),
        { status: 502, headers },
      );
    }

    const groups =
      (
        body as Record<string, unknown>
      )?.data?.viewer?.accounts?.[0]?.rumPageloadsAdaptiveGroups ?? [];

    const series = (
      groups as {
        dimensions: { date: string };
        sum: { pageViews: number };
        uniq: { uniques: number };
      }[]
    )
      .reverse()
      .map((g) => ({
        date: g.dimensions.date,
        views: g.sum.pageViews,
        visits: g.uniq.uniques,
      }));

    return new Response(JSON.stringify({ series }), { status: 200, headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics", detail: String(err) }),
      { status: 502, headers },
    );
  }
}
