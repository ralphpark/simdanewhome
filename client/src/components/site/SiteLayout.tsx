import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { SiteLoader } from "./SiteLoader";
import { siteEase } from "./motion";

export function SiteLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const reduce = useReducedMotion();
  const lenis = useRef<Lenis | null>(null);
  const main = useRef<HTMLElement>(null);
  const previousLocation = useRef(location);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lenis.current = new Lenis({ autoRaf: true, anchors: true });
    }
    return () => { lenis.current?.destroy(); lenis.current = null; window.history.scrollRestoration = previous; };
  }, [reduce]);

  useEffect(() => {
    if (lenis.current) lenis.current.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (previousLocation.current !== location) {
      previousLocation.current = location;
      const timer = window.setTimeout(() => main.current?.focus({ preventScroll: true }), reduce ? 0 : 240);
      return () => window.clearTimeout(timer);
    }
  }, [location, reduce]);

  return (
    <div className="site-shell min-h-screen">
      <SiteLoader />
      <SiteNav />
      <main id="site-main" ref={main} tabIndex={-1} className="grid min-h-[70svh] pt-12 focus:outline-none">
        <AnimatePresence initial={false}>
          <motion.div key={location} className="min-w-0 [grid-area:1/1]" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -8, pointerEvents: "none" }} transition={{ duration: reduce ? 0 : 0.22, ease: siteEase }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  );
}
