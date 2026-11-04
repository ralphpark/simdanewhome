import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, ShieldCheck } from "lucide-react";
import { CountUp, Reveal, ScaleOnScroll, Stagger } from "@/components/site/motion";
import { Logo } from "@/components/site/Logo";
import { clients, stats } from "@/content/brand";
import { copy } from "@/content/copy";
import type { SiteImageKey } from "@/content/images";
import { useSiteImage } from "@/hooks/useSiteImage";
import type { Portfolio, Post } from "@shared/schema";

const text = { heroStart: "식물과 함께하는", story: "심다의 이야기", workLabel: "대표 작업", emptyPosts: "새로운 식물 이야기를 준비하고 있습니다.", failedPosts: "식물 이야기를 불러오지 못했습니다." };

/** API covers keep their image; every editorial/fallback image stays admin-editable. */
function SitePhoto({ imageKey, src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement> & { imageKey: SiteImageKey }) {
  const fallback = useSiteImage(imageKey);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src, fallback.url]);
  return <img loading="lazy" decoding="async" {...props} src={!failed && src ? src : fallback.url} alt={!failed && src ? alt ?? fallback.alt : fallback.alt} onError={() => setFailed(true)} />;
}

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 0.55], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.32], [1, 0]);
  return <section ref={ref} className="a-home-hero" aria-labelledby="home-title">
    <ScaleOnScroll className="a-home-hero-scale" contentClassName="a-home-hero-frame">
      <SitePhoto imageKey="home.hero" className="a-home-cover" loading="eager" fetchPriority="high" />
      <div className="a-home-hero-shade" />
      <motion.div className="a-home-hero-copy" style={reduce ? undefined : { y, opacity }}>
        <h1 id="home-title"><span>{text.heroStart}</span><span>{copy.home.hero.title}.</span></h1>
        <p>{copy.home.hero.lead}</p><Link className="a-home-light-link" href="/story">{text.story} <span aria-hidden="true">›</span></Link>
      </motion.div>
      <a className="a-home-scroll" href="#home-numbers"><span>심다 알아보기</span><ArrowDown size={18} aria-hidden="true" /></a>
    </ScaleOnScroll>
  </section>;
}

const orderedStats = [stats[4], stats[2], stats[0], stats[3], stats[1]];
export function HomeNumbers() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [unlocked, setUnlocked] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", value => setUnlocked(previous => Math.max(previous, Math.min(4, Math.floor(value * 5)))));
  return <section ref={ref} id="home-numbers" className="a-home-numbers" aria-labelledby="home-numbers-title">
    <div className="a-home-numbers-sticky"><div className="site-container">
      <h2 id="home-numbers-title">{copy.home.numbers.title}</h2>
      <p className="a-home-numbers-lead">식물과 사람 사이,<br />꾸준히 쌓아온 시간.</p>
      <dl className="a-home-stat-grid">{orderedStats.map((stat, index) => {
        const visible = reduce || index <= unlocked;
        return <div key={stat.label} className="a-home-stat" data-revealed={!!visible}>
          <dt>{stat.label}</dt><dd>{index === 0 ? stat.value : visible ? <CountUp value={parseInt(stat.value, 10)} suffix={stat.value.replace(/^\d+/, "")} /> : <><span className="sr-only">{stat.value}</span><span aria-hidden="true">—</span></>}</dd>
          <div className="a-home-stat-line" aria-hidden="true"><motion.div initial={false} animate={{ scaleX: visible ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.8 }} /></div>
        </div>;
      })}</dl>
      <Link className="a-home-light-link" href="/story">{text.story} <span aria-hidden="true">›</span></Link>
    </div></div>
  </section>;
}

export function HomePlatform() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 0.55, 1], [-5, 0, 2]);
  const y = useTransform(scrollYProgress, [0, 0.6, 1], [100, 0, -40]);
  return <section ref={ref} className="a-home-platform site-section" aria-labelledby="home-platform-title"><div className="site-container">
    <Reveal className="a-home-centered"><p className="a-home-kicker">{copy.home.platform.eyebrow}</p><h2 id="home-platform-title" className="a-home-heading">{copy.home.platform.title}.</h2><p className="a-home-lead">{copy.home.platform.lead}</p><a className="site-link a-home-platform-link" href="https://www.simda.me" target="_blank" rel="noopener noreferrer">{copy.home.platform.cta} <ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (새 창)</span></a></Reveal>
    <motion.figure className="a-home-devices" style={reduce ? undefined : { rotate, y }} aria-label="식물 사진으로 구성한 PlantBid 플랫폼 기기 목업">
      <div className="a-home-browser"><div className="a-home-browser-bar" aria-hidden="true"><span className="a-home-browser-dots">● ● ●</span><span>simda.me</span></div><div className="a-home-browser-nav"><Logo className="a-home-device-logo" /><span>PlantBid</span></div><div className="a-home-browser-screen"><SitePhoto imageKey="home.platform" /><div className="a-home-device-caption">{copy.home.platform.title}<span>가까운 곳에서, 마음을 전하다.</span></div></div></div>
      <div className="a-home-phone" aria-hidden="true"><div className="a-home-phone-island" /><div className="a-home-phone-logo"><Logo className="a-home-device-logo" /></div><SitePhoto imageKey="home.platform" /><div className="a-home-phone-caption">{copy.home.platform.title}<span>PlantBid</span></div><div className="a-home-phone-home" /></div>
    </motion.figure>
    <div className="a-home-badge"><ShieldCheck size={18} aria-hidden="true" />{copy.home.platform.badge}</div>
  </div></section>;
}

function ServiceTile({ item }: { item: (typeof copy.home.services.items)[number] }) {
  return <Link href={`/services#${item.key}`} className="a-home-service-tile"><SitePhoto imageKey={`services.${item.key}` as SiteImageKey} /><div className="a-home-service-shade" /><h3>{item.title}</h3><div className="a-home-service-bottom"><p>{item.lead}</p><span className="a-home-tile-arrow" aria-hidden="true"><ArrowUpRight size={22} /></span></div></Link>;
}

export function HomeServices() {
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [position, setPosition] = useState({ start: true, end: false });
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => setPosition({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    update(); element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update); observer.observe(element);
    return () => { element.removeEventListener("scroll", update); observer.disconnect(); };
  }, []);
  function move(direction: number) {
    const element = rail.current;
    if (!element) return;
    const tile = element.querySelector<HTMLElement>("a");
    element.scrollBy({ left: direction * ((tile?.offsetWidth ?? 320) + 24), behavior: reduce ? "instant" : "smooth" });
  }
  return <section className="a-home-services site-section" aria-labelledby="home-services-title">
    <div className="site-container a-home-section-head"><Reveal><h2 id="home-services-title" className="a-home-heading">{copy.home.services.title}</h2><p className="a-home-lead">{copy.home.services.lead}</p></Reveal><Link className="site-link" href="/services">더 알아보기 <span aria-hidden="true">›</span></Link></div>
    <div ref={rail} id="home-service-rail" className="a-home-service-rail" role="region" aria-roledescription="캐러셀" aria-label="심다의 서비스" tabIndex={0} data-lenis-prevent>{copy.home.services.items.map(item => <ServiceTile key={item.key} item={item} />)}</div>
    <div className="site-container a-home-carousel-controls"><button type="button" onClick={() => move(-1)} disabled={position.start} aria-label="이전 서비스" aria-controls="home-service-rail"><ChevronLeft aria-hidden="true" /></button><button type="button" onClick={() => move(1)} disabled={position.end} aria-label="다음 서비스" aria-controls="home-service-rail"><ChevronRight aria-hidden="true" /></button></div>
  </section>;
}

async function fetchRows<T extends { id: string; title: string }>(path: string, signal: AbortSignal): Promise<T[]> {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error("콘텐츠를 불러오지 못했습니다.");
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("콘텐츠 응답이 올바르지 않습니다.");
  return data.filter((row): row is T => !!row && typeof row.id === "string" && typeof row.title === "string");
}
function timestamp(value: Date | string | null | undefined) { return value ? new Date(value).getTime() || 0 : 0; }

export function HomeWork() {
  const { data, isLoading, isError, refetch } = useQuery<Portfolio[]>({ queryKey: ["/api/portfolios"], queryFn: ({ signal }) => fetchRows<Portfolio>("/api/portfolios", signal) });
  const selected = [...(data ?? [])].sort((a, b) => Number(b.featured) - Number(a.featured) || timestamp(b.completedDate ?? b.createdAt) - timestamp(a.completedDate ?? a.createdAt)).slice(0, 3);
  return <section className="a-home-work" aria-labelledby="home-work-title">
    <div className="site-container a-home-section-head site-section"><Reveal><p className="a-home-kicker">{text.workLabel}</p><h2 id="home-work-title" className="a-home-heading">{copy.home.work.title}</h2><p className="a-home-lead">{copy.home.work.lead}</p></Reveal><Link className="site-link" href="/portfolio">{copy.home.work.cta} <span aria-hidden="true">›</span></Link></div>
    {isLoading && <p className="site-container a-home-status" role="status">대표 작업을 불러오는 중입니다.</p>}
    {isError && <p className="site-container a-home-status" role="status">대표 작업을 불러오지 못했습니다. <button className="site-link" type="button" onClick={() => refetch()}>다시 시도</button></p>}
    <div className="a-home-work-stack">{selected.length ? selected.map((project, index) => <article key={project.id} className="a-home-project" style={{ zIndex: index + 1 }}><SitePhoto imageKey="portfolio.hero" src={project.thumbnailUrl} alt={project.title} className="a-home-cover" /><div className="a-home-project-shade" /><div className="site-container a-home-project-copy"><p>{project.clientName || text.workLabel}</p><h3>{project.title}</h3><Link href={`/portfolio/${encodeURIComponent(project.id)}`} className="a-home-light-link">프로젝트 살펴보기 <span aria-hidden="true">›</span></Link></div><span className="a-home-project-index" aria-label={`${selected.length}개 중 ${index + 1}번째 프로젝트`}>{String(index + 1).padStart(2, "0")} / {String(selected.length).padStart(2, "0")}</span></article>) : <article className="a-home-project a-home-project-fallback"><SitePhoto imageKey="portfolio.hero" className="a-home-cover" /><div className="a-home-project-shade" /><div className="site-container a-home-project-copy"><h3>{copy.home.work.title}</h3><Link href="/portfolio" className="a-home-light-link">{copy.home.work.cta} <span aria-hidden="true">›</span></Link></div></article>}</div>
  </section>;
}

export function HomeClients() {
  const [paused, setPaused] = useState(false);
  const rows = [clients.slice(0, Math.ceil(clients.length / 2)), clients.slice(Math.ceil(clients.length / 2))];
  return <section className="a-home-clients site-section" aria-labelledby="home-clients-title" data-paused={paused}>
    <div className="site-container a-home-section-head"><h2 id="home-clients-title" className="a-home-heading">{copy.home.clients.title}</h2><button type="button" className="a-home-marquee-control" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}{paused ? "흐름 재생" : "흐름 멈춤"}</button></div>
    <div className="a-home-marquee">{rows.map((row, index) => <div key={index} className={`a-home-marquee-track a-home-marquee-track-${index}`}>{[0, 1].map(duplicate => <ul key={duplicate} aria-hidden={duplicate === 1 ? true : undefined}>{row.map(client => <li key={client}>{client}</li>)}</ul>)}</div>)}</div>
  </section>;
}

export function HomeMagazine() {
  const { data, isLoading, isError, refetch } = useQuery<Post[]>({ queryKey: ["/api/posts"], queryFn: ({ signal }) => fetchRows<Post>("/api/posts", signal) });
  const latest = (data ?? []).filter(post => post.published === true && (!post.publishedAt || timestamp(post.publishedAt) <= Date.now())).sort((a, b) => timestamp(b.publishedAt ?? b.createdAt) - timestamp(a.publishedAt ?? a.createdAt)).slice(0, 3);
  return <section className="a-home-magazine site-section" aria-labelledby="home-magazine-title"><div className="site-container">
    <div className="a-home-section-head"><Reveal><p className="a-home-kicker">{copy.nav.magazine}</p><h2 id="home-magazine-title" className="a-home-heading">{copy.home.magazine.title}</h2></Reveal><Link className="site-link" href="/magazine">{copy.home.magazine.cta} <span aria-hidden="true">›</span></Link></div>
    {isLoading ? <div role="status" className="a-home-empty">식물 이야기를 불러오는 중입니다.</div> : isError ? <div role="status" className="a-home-empty"><p>{text.failedPosts}</p><button type="button" className="site-link" onClick={() => refetch()}>다시 시도 <span aria-hidden="true">›</span></button></div> : latest.length ? <Stagger className="a-home-magazine-grid">{latest.map(post => <Reveal key={post.id}><article><Link className="a-home-post" href={`/magazine/${encodeURIComponent(post.id)}`}><div className="a-home-post-photo"><SitePhoto imageKey="magazine.hero" src={post.thumbnailUrl} alt={post.title} /></div><div className="a-home-post-copy"><p className="a-home-post-category">{post.category}</p><h3>{post.title}</h3>{post.excerpt && <p className="a-home-post-excerpt">{post.excerpt}</p>}<span className="site-link">읽어보기 <span aria-hidden="true">›</span></span></div></Link></article></Reveal>)}</Stagger> : <div className="a-home-empty"><p>{text.emptyPosts}</p><Link className="site-link" href="/magazine">{copy.home.magazine.cta} <span aria-hidden="true">›</span></Link></div>}
  </div></section>;
}

export function HomeClosing() {
  return <section className="a-home-closing" aria-labelledby="home-closing-title"><SitePhoto imageKey="home.cta" className="a-home-cover" /><div className="a-home-closing-shade" /><Reveal className="a-home-closing-copy site-container"><h2 id="home-closing-title" className="a-home-heading">{copy.home.closing.title}</h2><p>{copy.home.closing.lead}</p><div className="a-home-closing-actions"><Link href="/support/b2b" className="site-pill a-home-white-pill">{copy.home.closing.primaryCta}</Link><Link href="/support/booking" className="a-home-light-link">{copy.home.closing.secondaryCta} <span aria-hidden="true">›</span></Link></div></Reveal></section>;
}
