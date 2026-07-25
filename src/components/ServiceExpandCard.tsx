import { useState } from "react";

interface ServiceExpandItem {
  title: string;
  description: string;
  image: string;
  alt: string;
}

export function ServiceExpandCard({ services }: { services: ServiceExpandItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="service-expand-list">
      {services.map((s, i) => {
        const isOpen = hovered === i;
        return (
          <div
            key={s.title}
            className={`service-expand-item${isOpen ? " is-open" : ""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="service-expand-row">
              <span className="service-expand-num">
                {String(i + 1).padStart(3, "0")}
              </span>
              <div className="service-expand-text">
                <h3 className="service-expand-title">{s.title}</h3>
                <p className="service-expand-desc">{s.description}</p>
              </div>
              <div className="service-expand-img-wrap">
                <img
                  src={s.image}
                  alt={s.alt}
                  className="service-expand-img"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="service-expand-divider">
              <div className="service-expand-divider-fill" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
