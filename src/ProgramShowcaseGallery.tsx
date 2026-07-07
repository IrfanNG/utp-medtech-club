import { useCallback, useEffect, useRef, useState } from "react";
import { CinematicGalleryViewer } from "./CinematicGalleryViewer";

/* ------------------------------------------------------------------ *
 * ProgramShowcaseGallery
 * ------------------------------------------------------------------ *
 * A cinematic filmstrip gallery for a program detail page.
 *
 *   ┌─────────────────────────────────────────────────┐
 *   │                                                 │
 *   │            Large Featured Image                 │  ← hover: overlay + View Fullscreen
 *   │                                                 │
 *   └─────────────────────────────────────────────────┘
 *      ◀                              03 / 17                              ▶
 *   Project: SUKMED 2024
 *   Festival • 2024 • UTP Campus
 *   □□□□□□□□□□□□□□□□□□   (horizontal scrollable filmstrip)
 *   [ View all photos ]
 *
 * The featured image crossfades + scales when the active image
 * changes. The filmstrip supports mouse wheel, pointer drag with
 * momentum, and auto-scrolls the active thumb into view.
 * "View Fullscreen" / "View all photos" opens the existing
 * CinematicGalleryViewer lightbox seeded at the current image.
 * ------------------------------------------------------------------ */

interface ProgramShowcaseGalleryProps {
  images: string[];
  altPrefix: string;
  title?: string;
  meta?: string[];
}

const AUTOPLAY_MS = 4000;
const RESUME_DELAY_MS = 5000;
const TRANSITION_MS = 850;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

export function ProgramShowcaseGallery({
  images,
  altPrefix,
  title,
  meta,
}: ProgramShowcaseGalleryProps) {
  const [active, setActive] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [spotlightLoaded, setSpotlightLoaded] = useState(false);
  const [thumbsErrored, setThumbsErrored] = useState<Set<number>>(new Set());
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  const stripRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const lastDisplayIndexRef = useRef(0);
  const drag = useRef({
    active: false,
    startX: 0,
    startLeft: 0,
    moved: 0,
    lastX: 0,
    lastT: 0,
    vel: 0,
    raf: 0,
  });

  const count = images.length;

  // Fullscreen passthrough: hand off to the cinematic lightbox seeded on
  // the currently displayed image (hover preview or locked active image).
  const displayIndex =
    previewIndex !== null ? previewIndex : Math.min(active, count - 1);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const resumeAutoplayNow = useCallback(() => {
    clearResumeTimer();
    setAutoplayPaused(false);
  }, [clearResumeTimer]);

  const pauseAutoplay = useCallback(
    (resumeAfterInactivity = true) => {
      clearResumeTimer();
      setAutoplayPaused(true);
      if (resumeAfterInactivity && !reducedMotion) {
        resumeTimerRef.current = window.setTimeout(() => {
          setAutoplayPaused(false);
          resumeTimerRef.current = null;
        }, RESUME_DELAY_MS);
      }
    },
    [clearResumeTimer, reducedMotion],
  );

  useEffect(() => {
    return () => {
      clearResumeTimer();
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      cancelAnimationFrame(drag.current.raf);
    };
  }, [clearResumeTimer]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  useEffect(() => {
    if (viewAll) return;
    setActive(0);
    setPreviewIndex(null);
    setSpotlightLoaded(false);
    setThumbsErrored(new Set());
    setAutoplayPaused(false);
    setOutgoingIndex(null);
    lastDisplayIndexRef.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  useEffect(() => {
    if (viewAll) return;
    setSpotlightLoaded(false);
  }, [displayIndex, viewAll]);

  useEffect(() => {
    if (viewAll || reducedMotion) {
      lastDisplayIndexRef.current = displayIndex;
      setOutgoingIndex(null);
      return;
    }
    const previous = lastDisplayIndexRef.current;
    if (previous === displayIndex) return;
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    setOutgoingIndex(previous);
    lastDisplayIndexRef.current = displayIndex;
    transitionTimerRef.current = window.setTimeout(() => {
      setOutgoingIndex(null);
      transitionTimerRef.current = null;
    }, TRANSITION_MS);
  }, [displayIndex, reducedMotion, viewAll]);

  // Set the locked active image and clear any hover preview.
  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      setActive(((Math.min(i, count - 1) % count) + count) % count);
      setPreviewIndex(null);
    },
    [count],
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (count < 2 || viewAll || autoplayPaused || reducedMotion || previewIndex !== null) return;
    const id = window.setTimeout(() => {
      next();
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [active, autoplayPaused, count, next, previewIndex, reducedMotion, viewAll]);

  // Keyboard support: ←/→ when the gallery root is focused.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        pauseAutoplay();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        pauseAutoplay();
        next();
      }
    },
    [pauseAutoplay, prev, next],
  );

  // Keep active filmstrip thumbnail in view (smooth).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const thumb = strip.children[active] as HTMLElement | undefined;
    if (!thumb) return;
    const r = strip.getBoundingClientRect();
    const tr = thumb.getBoundingClientRect();
    if (tr.left < r.left) {
      strip.scrollTo({ left: strip.scrollLeft - (r.left - tr.left) - 16, behavior: "smooth" });
    } else if (tr.right > r.right) {
      strip.scrollTo({ left: strip.scrollLeft + (tr.right - r.right) + 16, behavior: "smooth" });
    }
  }, [active]);

  // Mouse-wheel → horizontal scroll (non-passive so we can preventDefault).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        strip.scrollLeft += e.deltaY;
      }
    };
    strip.addEventListener("wheel", onWheel, { passive: false });
    return () => strip.removeEventListener("wheel", onWheel);
  }, []);

  // Pointer drag with momentum scrolling.
  const onPointerDown = (e: React.PointerEvent) => {
    const strip = stripRef.current;
    if (!strip) return;
    pauseAutoplay();
    cancelAnimationFrame(drag.current.raf);
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: strip.scrollLeft,
      moved: 0,
      lastX: e.clientX,
      lastT: performance.now(),
      vel: 0,
      raf: 0,
    };
    strip.setPointerCapture?.(e.pointerId);
    strip.classList.add("is-dragging");
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const strip = stripRef.current;
    if (!strip) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = Math.abs(dx);
    strip.scrollLeft = drag.current.startLeft - dx;
    const now = performance.now();
    const dt = now - drag.current.lastT;
    if (dt > 0) drag.current.vel = (e.clientX - drag.current.lastX) / dt;
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const strip = stripRef.current;
    drag.current.active = false;
    strip?.releasePointerCapture?.(e.pointerId);
    strip?.classList.remove("is-dragging");
    // Momentum inertia.
    let vel = drag.current.vel * 16;
    const decel = 0.94;
    const step = () => {
      const s = stripRef.current;
      if (!s || Math.abs(vel) < 0.4) return;
      s.scrollLeft -= vel;
      vel *= decel;
      drag.current.raf = requestAnimationFrame(step);
    };
    if (Math.abs(vel) > 0.4) {
      cancelAnimationFrame(drag.current.raf);
      drag.current.raf = requestAnimationFrame(step);
    }
    pauseAutoplay();
  };

  // Thumb click vs drag: a click that follows a drag should not select.
  const onThumbClick = (i: number) => {
    if (drag.current.moved > 6) return;
    pauseAutoplay();
    goTo(i);
  };

  const onPrevClick = () => {
    pauseAutoplay();
    prev();
  };

  const onNextClick = () => {
    pauseAutoplay();
    next();
  };

  const onFeaturedEnter = () => {
    pauseAutoplay(false);
  };

  const onFeaturedLeave = () => {
    resumeAutoplayNow();
  };

  const onThumbEnter = (i: number) => {
    pauseAutoplay();
    setPreviewIndex(i);
  };

  const onThumbLeave = () => {
    setPreviewIndex(null);
    pauseAutoplay();
  };

  if (count === 0) return null;

  if (viewAll) {
    return (
      <CinematicGalleryViewer
        key={`viewall-${displayIndex}`}
        images={images}
        altPrefix={altPrefix}
        initialIndex={Math.min(displayIndex, count - 1)}
        initialFullscreen
        onCloseFullscreen={() => setViewAll(false)}
      />
    );
  }

  const activeSrc = images[displayIndex] ?? images[0];
  const activeAlt = `${altPrefix} — image ${displayIndex + 1}`;
  const outgoingSrc = outgoingIndex !== null ? images[outgoingIndex] : null;
  const outgoingAlt =
    outgoingIndex !== null ? `${altPrefix} — image ${outgoingIndex + 1}` : "";
  const counter = String(displayIndex + 1).padStart(2, "0") + " / " + String(count).padStart(2, "0");
  const metaLine = meta && meta.length > 0 ? meta.join(" • ") : "";
  const progressPaused = autoplayPaused || previewIndex !== null || reducedMotion;

  return (
    <div
      className="film-gallery"
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="group"
      aria-roledescription="gallery"
      aria-label={`${altPrefix} photo gallery`}
    >
      {/* Featured image */}
      <button
        type="button"
        className={"film-featured" + (progressPaused ? " is-autoplay-paused" : "")}
        onClick={() => {
          pauseAutoplay();
          setViewAll(true);
        }}
        onMouseEnter={onFeaturedEnter}
        onMouseLeave={onFeaturedLeave}
        onFocus={onFeaturedEnter}
        onBlur={onFeaturedLeave}
        aria-label={`Open image ${displayIndex + 1} of ${count} in fullscreen`}
      >
        <div className="film-featured-frame">
          {count > 1 && !progressPaused && (
            <span key={`progress-${displayIndex}`} className="film-progress" aria-hidden="true" />
          )}
          {!spotlightLoaded && <div className="film-featured-loading" aria-hidden="true" />}
          {outgoingSrc && (
            <img
              key={`outgoing-${outgoingIndex}`}
              src={outgoingSrc}
              alt={outgoingAlt}
              className="film-featured-img film-featured-img-outgoing"
              draggable={false}
              aria-hidden="true"
            />
          )}
          <img
            key={`active-${displayIndex}`}
            src={activeSrc}
            alt={activeAlt}
            className="film-featured-img film-featured-img-active"
            draggable={false}
            onLoad={() => setSpotlightLoaded(true)}
            onError={() => setSpotlightLoaded(true)}
          />
        </div>

        {/* Hover overlay */}
        <span className="film-featured-overlay" aria-hidden="true">
          <span className="film-fullscreen-btn">
            <span className="film-fullscreen-icon" aria-hidden="true">↗</span>
            View Fullscreen
          </span>
        </span>

        <span className="film-featured-counter" aria-hidden="true">{counter}</span>
      </button>

      {/* Prev / Next row */}
      <div className="film-nav-row">
        <button
          type="button"
          className="film-arrow"
          onClick={onPrevClick}
          disabled={count < 2}
          aria-label="Previous image"
        >
          ‹
        </button>
        <span className="film-nav-counter">{counter}</span>
        <button
          type="button"
          className="film-arrow"
          onClick={onNextClick}
          disabled={count < 2}
          aria-label="Next image"
        >
          ›
        </button>
      </div>

      {/* Project title + meta */}
      {(title || metaLine) && (
        <div className="film-info">
          {title && (
            <div className="film-info-title">
              <span className="film-info-label">Project:</span>{" "}
              <span className="film-info-name">{title}</span>
            </div>
          )}
          {metaLine && <div className="film-info-meta">{metaLine}</div>}
        </div>
      )}

      {/* Filmstrip */}
      <div
        className="film-strip"
        ref={stripRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {images.map((src, i) => {
          const isActive = i === displayIndex;
          const errored = thumbsErrored.has(i);
          return (
            <button
              key={i}
              type="button"
              className={"film-thumb" + (isActive ? " is-active" : "")}
              onClick={() => onThumbClick(i)}
              onMouseEnter={() => onThumbEnter(i)}
              onMouseLeave={onThumbLeave}
              onFocus={() => onThumbEnter(i)}
              onBlur={onThumbLeave}
              aria-label={`Image ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              tabIndex={0}
            >
              {errored ? (
                <span className="film-thumb-fallback" aria-hidden="true">✕</span>
              ) : (
                <img
                  src={src}
                  alt=""
                  loading={Math.abs(i - displayIndex) > 2 ? "lazy" : "eager"}
                  className="film-thumb-img"
                  draggable={false}
                  onError={() => setThumbsErrored((prev) => new Set(prev).add(i))}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* View all */}
      <button
        type="button"
        className="film-view-all"
        onClick={() => {
          pauseAutoplay();
          setViewAll(true);
        }}
      >
        View all photos ({count})
      </button>
    </div>
  );
}
