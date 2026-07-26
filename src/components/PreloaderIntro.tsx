import { useEffect, useRef, useState } from "react";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function PreloaderIntro({
  onRevealReady,
  onComplete,
}: {
  onRevealReady?: () => void;
  onComplete?: () => void;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(-2);
  const [visible, setVisible] = useState(true);
  const revealRef = useRef(onRevealReady);
  const completeRef = useRef(onComplete);
  revealRef.current = onRevealReady;
  completeRef.current = onComplete;

  useEffect(() => {
    const hash = window.location.hash || "#/";
    const path = hash.startsWith("#") ? hash.slice(1) : hash;
    if (path.startsWith("/admin")) {
      setVisible(false);
      return;
    }

    let timers: ReturnType<typeof setTimeout>[] = [];

    if (reduced) {
      setPhase(1);
      timers = [
        setTimeout(() => {
          setPhase(3);
          revealRef.current?.();
        }, 700),
        setTimeout(() => {
          setPhase(4);
          completeRef.current?.();
          setVisible(false);
        }, 1100),
      ];
    } else {
      setPhase(0);
      timers = [
        setTimeout(() => setPhase(1), 600),
        setTimeout(() => setPhase(2), 1400),
        setTimeout(() => {
          setPhase(3);
          revealRef.current?.();
        }, 2500),
        setTimeout(() => {
          setPhase(4);
          completeRef.current?.();
          setVisible(false);
        }, 3600),
      ];
    }

    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  if (!visible) return null;

  return (
    <div className="preloader-overlay" data-phase={phase} aria-hidden="true">
      <div className="preloader-grid" />
      <div className="preloader-scanlines" />
      <div className="preloader-split preloader-split--top" />
      <div className="preloader-split preloader-split--bottom" />
      <div className="preloader-content">
        <img
          className="preloader-logo"
          src="/medtech-logo.avif"
          alt=""
          width={280}
          height={280}
        />
        <div className="preloader-pulse-ring" />
        <span className="preloader-text">MEDTECH SYSTEM ONLINE</span>
      </div>
    </div>
  );
}
