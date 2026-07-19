import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CmsProject } from "../cms/types";

const AUTOPLAY_MS = 4000;

interface Props {
  projects: CmsProject[];
  onSelect(project: CmsProject): void;
}

function cyclicOffset(index: number, active: number, count: number): number {
  const raw = index - active;
  if (raw > count / 2) return raw - count;
  if (raw < -count / 2) return raw + count;
  return raw;
}

export function FeaturedProjectCarousel3D({ projects, onSelect }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const count = projects.length;

  const advance = useCallback(
    (dir: 1 | -1) => setActive((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = window.setInterval(() => advance(1), AUTOPLAY_MS);
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [paused, count, advance]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") advance(-1);
      else if (e.key === "ArrowRight") advance(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  const pause = () => setPaused(true);
  const unpause = () => setPaused(false);

  return (
    <div
      className="coverflow"
      onMouseEnter={pause}
      onMouseLeave={unpause}
      onFocus={pause}
      onBlur={unpause}
      role="region"
      aria-label="Featured projects carousel"
    >
      <div className="coverflow-stage">
        <div className="coverflow-viewport">
          {projects.map((p, i) => {
            const offset = cyclicOffset(i, active, count);

            const isCenter = offset === 0;
            const isLeft = offset === -1 || (count === 3 && offset === 2);
            const isRight = offset === 1 || (count === 3 && offset === -2);

            const x = isCenter ? 0 : isLeft ? -260 : isRight ? 260 : offset < 0 ? -520 : 520;
            const rotateY = isCenter ? 0 : isLeft ? 40 : isRight ? -40 : offset < 0 ? 55 : -55;
            const translateZ = isCenter ? 60 : isLeft || isRight ? -80 : -200;
            const scale = isCenter ? 1 : isLeft || isRight ? 0.78 : 0.55;
            const zIndex = isCenter ? 3 : isLeft || isRight ? 2 : 1;
            const opacity = isCenter ? 1 : isLeft || isRight ? 0.82 : 0;

            return (
              <motion.div
                key={p.id}
                className={`coverflow-card ${isCenter ? "is-center" : ""}`}
                animate={{ x, rotateY, scale, opacity, zIndex, translateZ }}
                transition={{ type: "spring", stiffness: 240, damping: 26 }}
                style={{ position: "absolute", transformStyle: "preserve-3d" }}
              >
                <button
                  className="coverflow-card-inner"
                  onClick={() => onSelect(p)}
                  aria-label={p.title}
                  tabIndex={isCenter ? 0 : -1}
                >
                  <img src={p.coverUrl} alt={p.alt} loading="lazy" className="coverflow-card-img" />
                  <div className="coverflow-card-body">
                    <span className="coverflow-card-tag">{p.category} &middot; {p.year}</span>
                    <h3>{p.title}</h3>
                    <p>{p.shortDesc}</p>
                    {isCenter && <span className="coverflow-card-cta">View project &rarr;</span>}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Arrows flanking the card group */}
        <button
          className="coverflow-arrow coverflow-arrow--left"
          aria-label="Previous project"
          onClick={() => advance(-1)}
        >
          &lsaquo;
        </button>
        <button
          className="coverflow-arrow coverflow-arrow--right"
          aria-label="Next project"
          onClick={() => advance(1)}
        >
          &rsaquo;
        </button>
      </div>

      {/* Dedicated navigation footer */}
      <div className="coverflow-nav">
        <div className="coverflow-dots" role="tablist" aria-label="Project slides">
          {projects.map((p, i) => (
            <button
              key={p.id}
              className={`coverflow-dot ${i === active ? "is-active" : ""}`}
              role="tab"
              aria-selected={i === active}
              aria-label={p.title}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>

      {/* Mobile fallback: vertical list */}
      <div className="coverflow-mobile-list">
        {projects.map((p) => (
          <button
            key={p.id}
            className="coverflow-mobile-card"
            onClick={() => onSelect(p)}
          >
            <img src={p.coverUrl} alt={p.alt} loading="lazy" className="coverflow-mobile-img" />
            <div className="coverflow-mobile-body">
              <span className="coverflow-card-tag">{p.category} &middot; {p.year}</span>
              <h3>{p.title}</h3>
              <p>{p.shortDesc}</p>
              <span className="coverflow-card-cta">View project &rarr;</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
