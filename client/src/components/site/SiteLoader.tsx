import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

const sessionKey = "simda:site-intro-seen";
let seenInMemory = false;

function shouldShowIntro() {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches || seenInMemory) return false;
  try { return sessionStorage.getItem(sessionKey) !== "1"; } catch { return !seenInMemory; }
}

export function SiteLoader() {
  const eligible = useRef<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (eligible.current === null) eligible.current = shouldShowIntro();
    setVisible(eligible.current && !media.matches);
    seenInMemory = true;
    try { sessionStorage.setItem(sessionKey, "1"); } catch { /* Session storage can be disabled. */ }
    const stop = () => { if (media.matches) setVisible(false); };
    media.addEventListener("change", stop);
    const timer = window.setTimeout(() => setVisible(false), 2700);
    return () => { window.clearTimeout(timer); media.removeEventListener("change", stop); };
  }, []);

  if (!visible) return null;
  return (
    <div className="ld" aria-hidden="true">
      <Logo variant="full" />
    </div>
  );
}

export function BrandSpinner({ label = "불러오는 중", className = "" }: { label?: string; className?: string }) {
  return (
    <span role="status" className={`inline-flex items-center justify-center text-site-green ${className}`}>
      <Logo variant="emblem" className="site-brand-spinner h-7 w-7" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
