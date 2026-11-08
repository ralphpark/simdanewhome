import { SiteText } from "@/components/site/SiteText";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { siteTextPages } from "@/content/siteTexts";
import type { SiteImageKey } from "@/content/images";
import { useSiteImage } from "@/hooks/useSiteImage";
import "./page-primitives.css";

export function Subpage({ children, className = "", passBar = true }: { children: ReactNode; className?: string; passBar?: boolean }) {
  return <article className={`subpage ${className}`}>{children}{passBar && <PassBar />}</article>;
}

export function ScrollReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`sp-reveal ${className}`}>{children}</div>;
}

type PageHeadProps = { eyebrow: ReactNode; title: ReactNode; intro?: ReactNode; actions?: ReactNode; imageKey?: SiteImageKey; id?: string; className?: string };
export function PageHead({ eyebrow, title, intro, actions, imageKey, id, className = "" }: PageHeadProps) {
  const generated = useId();
  const headingId = id ?? `page-head-${generated}`;
  return <header className={`sp-head ${imageKey ? "sp-head-photo" : "sp-head-short"} ${className}`} aria-labelledby={headingId}>
    <div className="sp-head-stage">
      <div className="sp-head-copy">
        <p className="t-eye">{eyebrow}</p><h1 id={headingId} className="t-hero">{title}</h1>
        {intro && <div className="t-intro">{intro}</div>}
        {actions && <div className="sp-actions">{actions}</div>}
      </div>
      {imageKey && <HeadPhoto imageKey={imageKey} />}
    </div>
  </header>;
}
function HeadPhoto({ imageKey }: { imageKey: SiteImageKey }) {
  const image = useSiteImage(imageKey);
  return <div className="sp-head-image"><img src={image.url} alt={image.alt} decoding="async" fetchPriority="high" /></div>;
}

export function PageSection({ children, id, eyebrow, title, intro, alt = false, center = false, className = "" }: {
  children?: ReactNode; id?: string; eyebrow?: ReactNode; title?: ReactNode; intro?: ReactNode; alt?: boolean; center?: boolean; className?: string;
}) {
  const generated = useId();
  const headingId = `${id ?? generated}-title`;
  return <section id={id} aria-labelledby={title ? headingId : undefined} className={`sp-section ${alt ? "sp-alt" : ""} ${className}`}>
    <div className="sp-wrap">
      {(eyebrow || title || intro) && <ScrollReveal className={`sp-section-heading ${center ? "sp-center" : ""}`}>
        {eyebrow && <p className="t-eye">{eyebrow}</p>}{title && <h2 id={headingId} className="t-h2">{title}</h2>}{intro && <div className="t-intro">{intro}</div>}
      </ScrollReveal>}
      {children}
    </div>
  </section>;
}

export function PhotoReveal({ src, alt, caption, className = "", eager = false, aspectRatio }: {
  src?: string | null; alt: string; caption?: ReactNode; className?: string; eager?: boolean; aspectRatio?: string;
}) {
  return <figure className={`sp-photo ${className}`} style={aspectRatio ? { "--sp-photo-ratio": aspectRatio } as CSSProperties : undefined}>
    <div className="sp-photo-frame">{src ? <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" /> : <div className="sp-photo-empty">{alt}</div>}</div>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

export type SegmentOption = { key: string; label: string };
export function SegmentedControl({ options, value, onChange, label }: { options: readonly SegmentOption[]; value: string; onChange: (value: string) => void; label: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [marker, setMarker] = useState({ left: 4, width: 0 });
  const active = Math.max(0, options.findIndex(option => option.key === value));
  const optionKeys = options.map(option => option.key).join("|");
  useLayoutEffect(() => {
    function measure() { const button = buttons.current[active]; if (button) setMarker({ left: button.offsetLeft, width: button.offsetWidth }); }
    measure();
    const observer = new ResizeObserver(measure);
    if (rail.current) observer.observe(rail.current);
    return () => observer.disconnect();
  }, [active, optionKeys]);
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % options.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + options.length - 1) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault(); onChange(options[next].key); buttons.current[next]?.focus();
    buttons.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }
  return <div className="sp-segments-scroll"><div className="sp-segments" ref={rail} role="radiogroup" aria-label={label}>
    <span className="sp-segment-marker" aria-hidden="true" style={{ width: marker.width, transform: `translateX(${marker.left}px)` }} />
    {options.map((option, index) => <button key={option.key} ref={element => { buttons.current[index] = element; }} role="radio" aria-checked={value === option.key} tabIndex={index === active ? 0 : -1} type="button" onClick={() => onChange(option.key)} onKeyDown={event => keyboard(event, index)}>{option.label}</button>)}
  </div></div>;
}

export type PhotoTileItem = { id: string; href: string; title: string; eyebrow?: string; description?: string; image?: string | null; alt?: string };
export function PhotoTile({ item }: { item: PhotoTileItem }) {
  return <Link className={`sp-tile ${item.image ? "" : "sp-tile-empty"}`} href={item.href}>
    {item.image && <img src={item.image} alt={item.alt ?? item.title} loading="lazy" decoding="async" />}
    <div className="sp-tile-shade" /><div className="sp-tile-copy">{item.eyebrow && <p className="sp-tile-eye">{item.eyebrow}</p>}<h3>{item.title}</h3>{item.description && <p>{item.description}</p>}<span><SiteText k="portfolio.work.detail" /> <span aria-hidden="true">›</span></span></div>
  </Link>;
}
export function Tiles({ items, className = "" }: { items: PhotoTileItem[]; className?: string }) {
  return <div className={`sp-tiles ${className}`}>{items.map(item => <PhotoTile key={item.id} item={item} />)}</div>;
}

export type WayItem = { title: ReactNode; lead: ReactNode; href: string; label: ReactNode; icon?: "booking" | "business" | "shop" };
const defaultWays: WayItem[] = [
  { title: <SiteText k="story.ways.item1.title" />, lead: <SiteText k="story.ways.item1.lead" />, href: "/support/booking", label: <SiteText k="story.ways.item1.link" />, icon: "booking" },
  { title: <SiteText k="story.ways.item2.title" />, lead: <SiteText k="story.ways.item2.lead" />, href: "/support/b2b", label: <SiteText k="story.ways.item2.link" />, icon: "business" },
  { title: <SiteText k="story.ways.item3.title" />, lead: <SiteText k="story.ways.item3.lead" />, href: "https://www.simda.me", label: <><SiteText k="story.ways.item3.link" /> ↗</>, icon: "shop" }
];
function WayIcon({ kind = "booking" }: { kind?: WayItem["icon"] }) {
  const paths = kind === "booking" ? ["M8 2v4", "M16 2v4", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z", "M3 10h18"] : kind === "business" ? ["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", "M10 6h4M10 10h4M10 14h4M10 18h4"] : ["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"];
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths.map(path => <path key={path} d={path} pathLength="1" />)}</svg>;
}
export function WaysCards({ title = <SiteText k="story.ways.title" />, intro, items = defaultWays, className = "" }: { title?: ReactNode; intro?: ReactNode; items?: WayItem[]; className?: string }) {
  return <PageSection title={title} intro={intro} className={`sp-ways ${className}`}><div className="sp-ways-grid" style={{ "--sp-way-count": Math.min(items.length, 3) } as CSSProperties}>
    {items.map(item => <div className="sp-way" key={item.href}><WayIcon kind={item.icon} /><h3>{item.title}</h3><p>{item.lead}</p>{/^https?:/.test(item.href) ? <a className="sp-link" href={item.href} target="_blank" rel="noopener">{item.label}</a> : <Link className="sp-link" href={item.href}>{item.label} <span aria-hidden="true">›</span></Link>}</div>)}
  </div></PageSection>;
}

export function PassBar() {
  const [location] = useLocation();
  const page = siteTextPages.find(page => page.path === location)?.id ?? (location.startsWith("/portfolio/") ? "portfolio" : location.startsWith("/magazine/") ? "magazine" : "home");
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > Math.min(window.innerHeight, 640));
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  // Visibility also removes the offscreen link from keyboard navigation.
  return <aside className="sp-pass" data-visible={visible} aria-label="예약상담" aria-hidden={!visible}>
    <p><SiteText k={`${page === "booking" ? "home" : page}.pass.body`} /></p><Link className="btn" href="/support/booking" tabIndex={visible ? 0 : -1}><SiteText k={`${page === "booking" ? "home" : page}.pass.link`} /></Link>
  </aside>;
}
