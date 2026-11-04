import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/site/Logo";
import { siteEase } from "@/components/site/motion";
import "./shared.css";

export function usePageTitle(title: string) { useEffect(() => { document.title = title; }, [title]); }
export function yearOf(date?: string | null) {
  if (!date) return "";
  const year = new Date(date).getFullYear();
  return Number.isFinite(year) ? String(year) : "";
}
export function dateLabel(date?: string | null) {
  if (!date || !Number.isFinite(new Date(date).getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}
export function Segments({ options, value, onChange, label }: { options: readonly { key: string; label: string }[]; value: string; onChange: (value: string) => void; label: string }) {
  const id = useId();
  const reduce = useReducedMotion();
  return <div className="b-segment-scroll" role="group" aria-label={label}><div className="b-segments">{options.map(option => <button type="button" key={option.key} aria-pressed={value === option.key} onClick={event => {
    onChange(option.key);
    const scroller = event.currentTarget.closest(".b-segment-scroll");
    if (scroller) { const button = event.currentTarget.getBoundingClientRect(); const bounds = scroller.getBoundingClientRect(); scroller.scrollBy({ left: button.left - bounds.left - (bounds.width - button.width) / 2, behavior: reduce ? "instant" : "smooth" }); }
  }}>
    {value === option.key && <motion.span className="b-segment-pill" layoutId={reduce ? undefined : `segment-${id}`} transition={{ type: "spring", stiffness: 450, damping: 38 }} />}
    <span className="b-segment-label">{option.label}</span>
  </button>)}</div></div>;
}
/** Measure actual CMS title line breaks rather than animating individual words. */
export function MaskTitle({ text, className = "", id }: { text: string; className?: string; id?: string }) {
  const measure = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState([text]);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const element = measure.current;
    if (!element) return;
    let active = true;
    const update = () => {
      if (!active || !element.firstChild) return;
      const range = document.createRange();
      const found: string[] = [];
      let top = -Infinity;
      for (let index = 0; index < text.length; index++) {
        range.setStart(element.firstChild, index); range.setEnd(element.firstChild, index + 1);
        const rect = range.getBoundingClientRect();
        if (rect.top > top + 3) { found.push(""); top = rect.top; }
        if (found.length) found[found.length - 1] += text[index];
      }
      const next = found.map(line => line.trim()).filter(Boolean);
      setLines(previous => previous.join("\n") === next.join("\n") ? previous : next.length ? next : [text]);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    document.fonts.ready.then(update);
    return () => { active = false; observer.disconnect(); };
  }, [text]);
  return <h1 id={id} aria-label={text} className={`b-mask-title ${className}`}><span ref={measure} className="b-title-measure" aria-hidden="true">{text}</span><span aria-hidden="true">{lines.map((line, index) => <span className="b-mask-line" key={`${line}-${index}`}><motion.span initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: reduce ? 0 : 0.85, delay: reduce ? 0 : index * 0.09, ease: siteEase }}>{line}</motion.span></span>)}</span></h1>;
}
export function ContentImage({ src, alt, eager = false, className = "" }: { src?: string | null; alt: string; eager?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  // Keep CMS data URLs intact; URL rewriting corrupts uploaded images.
  if (!src || failed) return <div className={`b-image-placeholder ${className}`} role="img" aria-label={`${alt} — 사진 준비 중`}><Logo variant="emblem" aria-hidden="true" /><span>사진 준비 중</span></div>;
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} className={className} />;
}
export function PageState({ title, detail, loading, retry, children, heading = 2 }: { title: string; detail?: string; loading?: boolean; retry?: () => void; children?: ReactNode; heading?: 1 | 2 }) {
  const Heading = heading === 1 ? "h1" : "h2";
  return <div className="b-page-state" role={loading ? "status" : undefined}><Logo variant="emblem" className={loading ? "site-brand-spinner" : ""} aria-hidden="true" /><Heading>{title}</Heading>{detail && <p>{detail}</p>}{retry && <button className="site-link" onClick={retry}>다시 불러오기 ›</button>}{children}</div>;
}
