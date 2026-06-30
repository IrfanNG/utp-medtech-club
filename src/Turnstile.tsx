import { useEffect, useRef, useState } from "react";

/* Minimal typings for the Cloudflare Turnstile explicit(renderer) API. */
interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __turnstileLoaderPromise?: Promise<void>;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstile(): Promise<void> {
  if (window.__turnstileLoaderPromise) return window.__turnstileLoaderPromise;
  window.__turnstileLoaderPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(script);
  });
  return window.__turnstileLoaderPromise;
}

export function Turnstile({
  siteKey,
  onToken,
  onExpire,
  onError,
}: {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadFailed(false);
    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: onToken,
          "expired-callback": onExpire,
          "error-callback": onError,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        onError?.();
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (loadFailed) {
    return (
      <div className="cf-turnstile-container cf-turnstile-failed" role="alert">
        <span className="cf-turnstile-failed-text">
          Captcha failed to load. Check your connection and refresh the page.
        </span>
      </div>
    );
  }

  return <div ref={containerRef} className="cf-turnstile-container" />;
}