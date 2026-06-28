interface Env {
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_TAG?: string;
  CLOUDFLARE_HOSTNAME?: string;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const apiToken = context.env.CLOUDFLARE_API_TOKEN;
  const accountTag = context.env.CLOUDFLARE_ACCOUNT_TAG;
  const hostname = context.env.CLOUDFLARE_HOSTNAME || "utp-medtech-club.pages.dev";

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

    const body = await res.json<unknown>();

    if (!res.ok || (body as Record<string, unknown>)?.errors) {
      return new Response(JSON.stringify({ error: "CF API error", detail: body }), {
        status: 502,
        headers,
      });
    }

    const groups =
      (
        body as Record<string, unknown>
      )?.data?.viewer?.accounts?.[0]?.rumPageloadsAdaptiveGroups ?? [];

    const series = (groups as { dimensions: { date: string }; sum: { pageViews: number }; uniq: { uniques: number } }[])
      .reverse()
      .map((g) => ({
        date: g.dimensions.date,
        views: g.sum.pageViews,
        visitors: g.uniq.uniques,
      }));

    return new Response(JSON.stringify({ series }), { status: 200, headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics", detail: String(err) }),
      { status: 502, headers },
    );
  }
}
