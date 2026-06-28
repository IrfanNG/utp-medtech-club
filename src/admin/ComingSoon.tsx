import type { ReactNode } from "react";

interface ComingSoonProps {
  title: string;
  icon: ReactNode;
  description?: string;
}

export function ComingSoon({ title, icon, description }: ComingSoonProps) {
  return (
    <div className="adm-page">
      <div className="adm-coming-soon">
        <div className="adm-coming-soon-icon">{icon}</div>
        <h2>{title}</h2>
        <p>This section is under construction.</p>
        {description && <p className="adm-coming-soon-desc">{description}</p>}
        <div className="adm-coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
}