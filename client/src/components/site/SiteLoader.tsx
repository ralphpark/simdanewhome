import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";

const sessionKey = "simda:site-intro-seen";
let seenInMemory = false;

function shouldShowIntro() {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches || seenInMemory) return false;
  try { return sessionStorage.getItem(sessionKey) !== "1"; } catch { return !seenInMemory; }
}

export function SiteLoader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(shouldShowIntro);
  useEffect(() => {
    seenInMemory = true;
    try { sessionStorage.setItem(sessionKey, "1"); } catch { /* Session storage can be disabled. */ }
    if (reduce) { setVisible(false); return; }
    // Bracket 0–.5s → letters .42–1.3s → emblem 1.05–1.35s →
    // hold until 1.6s → fade/scale out by 1.92s; remove before 2 seconds.
    const timer = window.setTimeout(() => setVisible(false), 1950);
    return () => window.clearTimeout(timer);
  }, [reduce]);

  if (!visible || reduce) return null;
  return (
    <div className="site-loader site-shell pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-site-white text-site-green" aria-hidden="true">
      <Logo variant="full" intro className="w-[240px] max-w-[72vw] tablet:w-[300px]" />
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
