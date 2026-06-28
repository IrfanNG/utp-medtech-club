import { useMemo, useState } from "react";
import { useCms } from "../cms/CmsContext";
import { AdminIcon } from "./AdminIcons";

const dateRanges = ["7 Days", "30 Days", "90 Days", "1 Year"];

function computeTrend(
  series: { views: number; visits: number }[],
  key: "views" | "visits",
): { value: string; up: boolean } | null {
  if (series.length < 2) return null;
  const mid = Math.floor(series.length / 2);
  const first = series.slice(0, mid).reduce((s, p) => s + p[key], 0);
  const last = series.slice(mid).reduce((s, p) => s + p[key], 0);
  if (first === 0) return null;
  const pct = ((last - first) / first) * 100;
  return { value: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`, up: pct >= 0 };
}

export function Dashboard() {
  const { analytics, projects, activities } = useCms();
  const [range, setRange] = useState("30 Days");

  const chartData = useMemo(() => {
    const all = analytics.series;
    if (range === "7 Days") return all.slice(-7);
    if (range === "90 Days") return all.slice(-90);
    return all;
  }, [analytics.series, range]);

  const pageViewTrend = computeTrend(analytics.series, "views");
  const visitsTrend = computeTrend(analytics.series, "visits");

  const hasAnalytics = analytics.series.length > 0;

  return (
    <div className="adm-page">
      {/* Header */}
      <div className="adm-page-head">
        <div>
          <h1>Welcome back, Admin</h1>
          <p>Here's what's happening with your website today.</p>
        </div>
        <div className="adm-date-select">
          <AdminIcon.calendar size={16} />
          <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
            {dateRanges.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="adm-kpi-grid">
        <KpiCard
          icon={AdminIcon.eye}
          label="Total Page Views"
          value={hasAnalytics ? analytics.totalPageViews.toLocaleString() : "N/A"}
          trend={pageViewTrend?.value}
          trendUp={pageViewTrend?.up}
          color="#ff1a0f"
        />
        <KpiCard
          icon={AdminIcon.users}
          label="Total Visits"
          value={hasAnalytics ? analytics.totalVisits.toLocaleString() : "N/A"}
          trend={visitsTrend?.value}
          trendUp={visitsTrend?.up}
          color="#6366f1"
        />
        <KpiCard
          icon={AdminIcon.projects}
          label="Total Projects"
          value={String(analytics.totalProjects)}
          color="#0ea5e9"
        />
        <KpiCard
          icon={AdminIcon.image}
          label="Total Images"
          value={String(analytics.totalImages)}
          color="#22c55e"
        />
        <KpiCard
          icon={AdminIcon.video}
          label="Total Videos"
          value={String(analytics.totalVideos)}
          color="#f59e0b"
        />
      </div>

      {/* Analytics + Donut */}
      <div className="adm-row">
        <div className="adm-card adm-chart-card">
          {analytics.analyticsError ? (
            <div className="adm-card-head">
              <h3>Website Analytics</h3>
              <p className="adm-muted">{analytics.analyticsError}</p>
            </div>
          ) : hasAnalytics ? (
            <>
              <div className="adm-card-head">
                <div>
                  <h3>Website Analytics</h3>
                  <p className="adm-card-sub">Page views and visits over time</p>
                </div>
                <div className="adm-chart-legend">
                  <span><span className="adm-dot red" /> Views</span>
                  <span><span className="adm-dot blue" /> Visits</span>
                </div>
              </div>
              <div className="adm-chart-stats">
                <div>
                  <span className="adm-chart-stat-val">{analytics.totalViews.toLocaleString()}</span>
                  <span className="adm-chart-stat-label">Views</span>
                </div>
                <div>
                  <span className="adm-chart-stat-val">{analytics.uniqueVisits.toLocaleString()}</span>
                  <span className="adm-chart-stat-label">Unique Visits</span>
                </div>
              </div>
              <LineChart data={chartData} />
            </>
          ) : (
            <div className="adm-card-head">
              <h3>Website Analytics</h3>
              <p className="adm-muted">No analytics data yet. Data appears within 24 hours of enabling Cloudflare Web Analytics.</p>
            </div>
          )}
        </div>

        <div className="adm-card adm-donut-card">
          <div className="adm-card-head">
            <h3>Content Overview</h3>
          </div>
          <DonutChart segments={analytics.contentOverview} />
        </div>
      </div>

      {/* Recent Projects + Activity */}
      <div className="adm-row">
        <div className="adm-card adm-activity-card">
          <div className="adm-card-head">
            <h3>Recent Activity</h3>
          </div>
          {activities.length === 0 ? (
            <p className="adm-muted">No recent activity yet.</p>
          ) : (
            <div className="adm-timeline">
              {activities.slice(0, 8).map((a) => (
                <div className="adm-timeline-item" key={a.id}>
                  <span className={`adm-timeline-dot ${a.type}`} />
                  <div className="adm-timeline-body">
                    <span className="adm-timeline-msg">{a.message}</span>
                    <span className="adm-timeline-time">{timeAgo(a.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-card adm-recent-projects-card">
          <div className="adm-card-head">
            <h3>Recent Projects</h3>
            <a href="#/admin/projects" className="adm-link">View all</a>
          </div>
          {analytics.recentProjects.length === 0 ? (
            <p className="adm-muted">No projects yet.</p>
          ) : (
            <div className="adm-recent-list">
              {analytics.recentProjects.map((p, i) => (
                <div className="adm-recent-item" key={i}>
                  <div className="adm-recent-info">
                    <strong>{p.title}</strong>
                    <span>{p.date}</span>
                  </div>
                  <span className={`adm-status adm-status-${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="adm-card">
        <div className="adm-card-head">
          <h3>Quick Actions</h3>
        </div>
        <div className="adm-quick-actions">
          <a href="#/admin/projects" className="adm-quick-action">
            <AdminIcon.plus size={20} />
            <span>New Project</span>
          </a>
          <a href="#/admin/media" className="adm-quick-action">
            <AdminIcon.upload size={20} />
            <span>Upload Media</span>
          </a>
          <a href="#/admin/clients" className="adm-quick-action">
            <AdminIcon.clients size={20} />
            <span>Add Client</span>
          </a>
          <a href="#/admin/settings" className="adm-quick-action">
            <AdminIcon.settings size={20} />
            <span>Edit Settings</span>
          </a>
          <a href="#/" className="adm-quick-action">
            <AdminIcon.eye size={20} />
            <span>View Website</span>
          </a>
        </div>
        {projects.length > 0 && <span className="adm-hidden-filler" />}
      </div>
    </div>
  );
}

/* ---------- KPI card ---------- */

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  color,
}: {
  icon: (p: { size?: number }) => React.ReactNode;
  label: string;
  value: string;
  trend?: string | null;
  trendUp?: boolean | null;
  color: string;
}) {
  return (
    <div className="adm-kpi-card">
      <div className="adm-kpi-top">
        <div className="adm-kpi-icon" style={{ background: `${color}18`, color }}>
          <Icon size={22} />
        </div>
        {trend != null && (
          <span className={`adm-kpi-trend ${trendUp ? "up" : ""}`}>{trend}</span>
        )}
      </div>
      <div className="adm-kpi-value">{value}</div>
      <div className="adm-kpi-label">{label}</div>
    </div>
  );
}

/* ---------- Line Chart ---------- */

function LineChart({ data }: { data: { date: string; views: number; visits: number }[] }) {
  const w = 640;
  const h = 200;
  const pad = { top: 10, right: 10, bottom: 24, left: 36 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const max = Math.max(...data.flatMap((d) => [d.views, d.visits]), 10);
  const xStep = data.length > 1 ? cw / (data.length - 1) : cw;
  const yScale = (v: number) => pad.top + ch - (v / max) * ch;

  const toPath = (key: "views" | "visits") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${pad.left + i * xStep} ${yScale(d[key])}`).join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => pad.top + ch * f);

  const labels = data.length <= 7
    ? data.map((d) => d.date.slice(5))
    : [0, Math.floor(data.length / 3), Math.floor((data.length * 2) / 3), data.length - 1].map((i) => data[i]?.date.slice(5) ?? "");

  return (
    <div className="adm-chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} className="adm-line-chart" preserveAspectRatio="none">
        {gridLines.map((y, i) => (
          <line key={i} x1={pad.left} y1={y} x2={w - pad.right} y2={y} className="adm-chart-grid" />
        ))}
        <path d={toPath("views")} className="adm-chart-line views" />
        <path d={toPath("views")} className="adm-chart-area views" />
        <path d={toPath("visits")} className="adm-chart-line visitors" />
        {data.map((d, i) => (
          <circle key={i} cx={pad.left + i * xStep} cy={yScale(d.views)} r="2.5" className="adm-chart-dot views" />
        ))}
      </svg>
      <div className="adm-chart-xlabels">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Donut Chart ---------- */

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const R = 64;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="adm-donut-wrap">
      <svg viewBox="0 0 160 160" className="adm-donut">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#f1f5f9" strokeWidth="20" />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * C;
          const el = (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="80" y="76" textAnchor="middle" className="adm-donut-total">{total}</text>
        <text x="80" y="94" textAnchor="middle" className="adm-donut-label">Total</text>
      </svg>
      <div className="adm-donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="adm-donut-legend-item">
            <span className="adm-dot" style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <span className="adm-donut-val">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}
