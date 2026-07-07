import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * CinematicGalleryViewer
 * ------------------------------------------------------------------ *
 * A single active image on a dark backdrop with a scrollable thumbnail
 * filmstrip, prev/next navigation (wrap-around), keyboard support,
 * touch swipe, and a fullscreen lightbox with focus trap + body scroll
 * lock. No external dependencies beyond React.
 *
 * Props:
 *   images    — ordered gallery image URLs
 *   altPrefix — used to generate alt text: `${altPrefix} — image ${n}`
 * ------------------------------------------------------------------ */

interface CinematicGalleryViewerProps {
  images: string[];
  altPrefix: string;
  /** Index to open the viewer on (defaults to 0). */
  initialIndex?: number;
  /** When true, render the fullscreen lightbox immediately on mount. */
  initialFullscreen?: boolean;
  /**
   * Fired when the fullscreen lightbox is closed by the user. Used by hosts
   * that spawn the viewer solely for fullscreen browsing so they can unmount
   * it. When omitted, closing the lightbox falls back to the inline viewer.
   */
  onCloseFullscreen?: () => void;
}

const TRANSITION_MS = 250;
const AUTOPLAY_MS = 4000;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function preload(src: string): void {
  if (!src) return;
  const img = new Image();
  img.src = src;
}

export function CinematicGalleryViewer({
  images,
  altPrefix,
  initialIndex = 0,
  initialFullscreen = false,
  onCloseFullscreen,
}: CinematicGalleryViewerProps) {
  const [active, setActive] = useState(() => {
    const n = images.length;
    return n > 0 ? ((Math.min(initialIndex, n - 1) % n) + n) % n : 0;
  });
  const [fullscreen, setFullscreen] = useState(initialFullscreen);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [errored, setErrored] = useState<Set<number>>(new Set());
  const [hoverPaused, setHoverPaused] = useState(false);

  // Resolve the portal target lazily so this works in any client render
  // and stays SSR-safe (document may be undefined on the server).
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalTarget(typeof document !== "undefined" ? document.body : null);
  }, []);

  // When spawned as a modal-only handoff (initialFullscreen + onCloseFullscreen)
  // we never render the inline viewer underneath — the host unmounts us on
  // close, so the inline view would only flash briefly before disappearing.
  const modalOnly = initialFullscreen && Boolean(onCloseFullscreen);

  const viewportRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Close the fullscreen lightbox. When spawned via initialFullscreen, the
  // host unmounts the viewer through onCloseFullscreen; otherwise we just
  // return to the inline viewer.
  const closeFullscreen = useCallback(() => {
    setFullscreen(false);
    onCloseFullscreen?.();
  }, [onCloseFullscreen]);

  // Track reduced-motion preference reactively (autoplay must stop if enabled)
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
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

  // Mark image as loaded
  const markLoaded = useCallback((i: number) => {
    setLoaded((prev) => new Set(prev).add(i));
  }, []);

  const markErrored = useCallback((i: number) => {
    setErrored((prev) => new Set(prev).add(i));
  }, []);

  // Preload adjacent images whenever active changes
  useEffect(() => {
    if (count < 2) return;
    preload(images[(active + 1) % count]);
    preload(images[(active - 1 + count) % count]);
  }, [active, images, count]);

  // Autoplay: advance active image every AUTOPLAY_MS, with wrap-around.
  // Disabled when: fewer than 2 images, fullscreen open, reduced-motion
  // preferred, or viewer is hovered/focused (user is actively browsing).
  // The timer resets whenever `active` changes (manual nav or autoplay
  // advance), so a user click never triggers an instant jump.
  useEffect(() => {
    if (count < 2 || fullscreen || reducedMotion || hoverPaused) return;
    const id = window.setTimeout(() => {
      next();
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [active, count, fullscreen, reducedMotion, hoverPaused, next]);

  // Keep active filmstrip thumbnail in view
  useEffect(() => {
    const strip = filmstripRef.current;
    if (!strip) return;
    const thumb = strip.children[active] as HTMLElement | undefined;
    if (!thumb) return;
    const stripRect = strip.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    if (thumbRect.left < stripRect.left) {
      strip.scrollLeft -= stripRect.left - thumbRect.left + 8;
    } else if (thumbRect.right > stripRect.right) {
      strip.scrollLeft += thumbRect.right - stripRect.right + 8;
    }
  }, [active]);

  // Keyboard navigation (works in both inline and fullscreen mode)
  useEffect(() => {
    if (count < 2) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "Escape" && fullscreen) {
        closeFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, fullscreen, count, closeFullscreen]);

  // Fullscreen: focus trap + body scroll lock + focus restoration
  useEffect(() => {
    if (!fullscreen) return;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Store currently focused element for restoration
    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    // Focus the fullscreen container
    const fs = fullscreenRef.current;
    if (fs) {
      fs.focus();
    }

    // Focus trap
    const trapHandler = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !fullscreenRef.current) return;
      const focusable = fullscreenRef.current.querySelectorAll<HTMLElement>(
        'button, [tabindex="0"]',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trapHandler);

    return () => {
      window.removeEventListener("keydown", trapHandler);
      document.body.style.overflow = prevOverflow;
      if (lastFocusedRef.current) {
        lastFocusedRef.current.focus();
      }
    };
  }, [fullscreen]);

  // Touch swipe on the active image viewport
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || count < 2) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  if (count === 0) return null;

  const transitionStyle = reducedMotion ? undefined : `opacity ${TRANSITION_MS}ms ease`;

  const activeSrc = images[active];
  const activeAlt = `${altPrefix} — image ${active + 1}`;
  const isActiveLoaded = loaded.has(active);
  const isActiveErrored = errored.has(active);

  const renderActiveImage = (key: string, className: string) => (
    <img
      key={key}
      src={activeSrc}
      alt={activeAlt}
      className={className}
      style={{ opacity: isActiveLoaded ? 1 : 0, transition: transitionStyle }}
      onLoad={() => markLoaded(active)}
      onError={() => markErrored(active)}
      draggable={false}
    />
  );

  return (
    <>
      {/* Inline viewer — skipped when spawned purely as a fullscreen modal */}
      {!modalOnly && (
      <div className="cinematic-viewer">
        {/* Active image viewport */}
        <div
          className="cinematic-viewport"
          ref={viewportRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          onFocus={() => setHoverPaused(true)}
          onBlur={() => setHoverPaused(false)}
        >
          {!isActiveLoaded && !isActiveErrored && (
            <div className="cinematic-placeholder">Loading…</div>
          )}
          {isActiveErrored && (
            <div className="cinematic-placeholder cinematic-placeholder-error">
              Image unavailable
            </div>
          )}
          {renderActiveImage(`inline-${active}`, "cinematic-active-img")}

          {count > 1 && (
            <>
              <button
                className="cinematic-nav cinematic-nav-prev"
                onClick={prev}
                aria-label="Previous image"
                tabIndex={0}
              >
                ‹
              </button>
              <button
                className="cinematic-nav cinematic-nav-next"
                onClick={next}
                aria-label="Next image"
                tabIndex={0}
              >
                ›
              </button>
            </>
          )}

          <div className="cinematic-toolbar">
            <span className="cinematic-counter">
              {active + 1} / {count}
            </span>
            <button
              className="cinematic-fullscreen-btn"
              onClick={() => setFullscreen(true)}
              aria-label="Open fullscreen"
              tabIndex={0}
            >
              fullscreen
            </button>
          </div>
        </div>

        {/* Filmstrip */}
        {count > 1 && (
          <div
            className="cinematic-filmstrip"
            ref={filmstripRef}
            onMouseEnter={() => setHoverPaused(true)}
            onMouseLeave={() => setHoverPaused(false)}
            onFocus={() => setHoverPaused(true)}
            onBlur={() => setHoverPaused(false)}
          >
            {images.map((src, i) => (
              <button
                key={i}
                className={`cinematic-thumb ${i === active ? "cinematic-thumb-active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Image ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                tabIndex={0}
              >
                <img
                  src={src}
                  alt=""
                  loading={Math.abs(i - active) > 2 ? "lazy" : "eager"}
                  className="cinematic-thumb-img"
                  onError={() => markErrored(i)}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Fullscreen lightbox — portaled to document.body so it escapes any
          ancestor transformed/filtered stacking context (e.g. the reveal
          animation container) and always sits above the navbar. */}
      {fullscreen && portalTarget && createPortal(
        <div
          className="cinematic-lightbox"
          ref={fullscreenRef}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFullscreen();
          }}
        >
          <button
            className="cinematic-lightbox-close"
            onClick={closeFullscreen}
            aria-label="Close fullscreen"
            tabIndex={0}
          >
            ✕
          </button>

          <div
            className="cinematic-lightbox-viewport"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {!isActiveLoaded && !isActiveErrored && (
              <div className="cinematic-placeholder">Loading…</div>
            )}
            {isActiveErrored && (
              <div className="cinematic-placeholder cinematic-placeholder-error">
                Image unavailable
              </div>
            )}
            {renderActiveImage(`fs-${active}`, "cinematic-lightbox-img")}
          </div>

          {count > 1 && (
            <>
              <button
                className="cinematic-nav cinematic-nav-prev cinematic-lightbox-nav"
                onClick={prev}
                aria-label="Previous image"
                tabIndex={0}
              >
                ‹
              </button>
              <button
                className="cinematic-nav cinematic-nav-next cinematic-lightbox-nav"
                onClick={next}
                aria-label="Next image"
                tabIndex={0}
              >
                ›
              </button>
            </>
          )}

          <div className="cinematic-lightbox-toolbar">
            <span className="cinematic-counter">
              {active + 1} / {count}
            </span>
          </div>
        </div>,
        portalTarget,
      )}
    </>
  );
}