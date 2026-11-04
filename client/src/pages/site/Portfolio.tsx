import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { copy } from "@/content/copy";
import { projects, stats } from "@/content/brand";
import { useSiteImage } from "@/hooks/useSiteImage";
import { CountUp, Reveal, siteEase } from "@/components/site/motion";
import { categoryKey, categoryLabel, usePortfolios } from "./portfolio/data";
import { ContentImage, MaskTitle, PageState, Segments, usePageTitle, yearOf } from "./portfolio/ui";
import "./portfolio/portfolio.css";

const text = { selected: "선별된 공간들", empty: "이 분류의 프로젝트 사진을 준비하고 있습니다.", emptyLead: "아래 아카이브에서 심다의 작업 기록을 만나보세요.", inquiry: "함께 만들고 싶은 공간이 있나요?" };

export default function Portfolio() {
  usePageTitle(copy.seo["/portfolio"].title);
  const { data = [], isPending, isError, refetch } = usePortfolios();
  const fallback = useSiteImage("portfolio.hero");
  const [category, setCategory] = useState("all");
  const reduce = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const featured = data.find(item => item.featured);
  const featuredImage = featured?.thumbnailUrl || featured?.images?.[0];
  const visible = data.filter(item => category === "all" || categoryKey(item.category) === category);
  const archive = useMemo(() => {
    const filtered = projects.filter(item => category === "all" || categoryKey(item.category) === category);
    return Array.from(new Set(filtered.map(item => item.year))).sort((a, b) => b - a).map(year => ({ year, items: filtered.filter(item => item.year === year) }));
  }, [category]);
  const projectStat = stats.find(stat => stat.label === "대외 프로젝트")!;
  return <article className="team-b portfolio-page">
    <section ref={hero} className="pb-hero-track" aria-labelledby="portfolio-title"><div className="pb-hero-sticky"><motion.div className="pb-hero" style={reduce ? undefined : { scale, y }}>
      <ContentImage src={featuredImage || fallback.url} alt={featuredImage ? featured!.title : fallback.alt} eager className="pb-hero-image" /><div className="pb-hero-shade" />
      <div className="pb-hero-content site-container"><p className="b-kicker">{copy.nav.portfolio}</p><MaskTitle id="portfolio-title" className="pb-hero-title" text={copy.portfolio.hero.title} /><p className="pb-hero-lead">{copy.portfolio.hero.lead}</p>
        <div className="pb-hero-bottom">{featured ? <Link href={`/portfolio/${encodeURIComponent(featured.id)}`} className="pb-feature-link"><span>{categoryLabel(featured.category)}{yearOf(featured.completedDate) ? ` · ${yearOf(featured.completedDate)}` : ""}</span><strong>{featured.title} <span aria-hidden="true">↗</span></strong></Link> : <span className="pb-hero-note">{copy.home.work.lead}</span>}<a href="#portfolio-work" className="pb-scroll-link">작업 둘러보기 <span aria-hidden="true">↓</span></a></div>
      </div>
    </motion.div></div></section>
    <section id="portfolio-work" className="site-section pb-work" aria-labelledby="work-title"><div className="site-container">
      <Reveal className="b-section-heading"><h2 id="work-title" className="site-headline">{text.selected}</h2><a href="#portfolio-archive" className="site-link">아카이브 보기 <span aria-hidden="true">↓</span></a></Reveal>
      <Segments label="프로젝트 카테고리" options={copy.portfolio.filters} value={category} onChange={setCategory} />
      <p className="b-result-count" role="status" aria-live="polite">{isPending ? "프로젝트를 불러오는 중" : isError ? "프로젝트 사진을 불러오지 못했습니다" : `${visible.length}개의 프로젝트`} · 아카이브 {archive.reduce((sum, group) => sum + group.items.length, 0)}건</p>
      {isPending ? <PageState title="작업의 기록을 불러옵니다" loading /> : isError ? <PageState title="프로젝트 사진을 불러오지 못했습니다." detail="아래 아카이브는 계속 둘러볼 수 있습니다." retry={() => refetch()} /> : <>
        <motion.div layout={!reduce} className="pb-grid"><AnimatePresence initial={false} mode="popLayout">{visible.map((item, index) => <motion.div layout={!reduce} key={item.id} className={`pb-tile pb-tile-${index % 6}`} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : 12 }} transition={{ duration: reduce ? 0 : 0.55, ease: siteEase }}>
          <Link href={`/portfolio/${encodeURIComponent(item.id)}`} className="pb-tile-link"><ContentImage src={item.thumbnailUrl || item.images?.[0]} alt={item.title} /><div className="pb-tile-shade" /><span className="pb-tile-category">{categoryLabel(item.category)}</span><div className="pb-tile-caption"><span>{yearOf(item.completedDate)}</span><h3>{item.title}</h3></div><span className="pb-tile-arrow" aria-hidden="true">↗</span></Link>
        </motion.div>)}</AnimatePresence></motion.div>
        {visible.length === 0 && <PageState title={text.empty} detail={text.emptyLead}>{category !== "all" && <button className="site-link" onClick={() => setCategory("all")}>전체 작업 보기 ›</button>}</PageState>}
      </>}
    </div></section>
    <section id="portfolio-archive" className="pb-archive site-section" aria-labelledby="archive-title"><div className="site-container">
      <Reveal className="pb-archive-heading"><div><p className="b-kicker">{copy.portfolio.archive.title}</p><h2 id="archive-title">프로젝트<br /><CountUp value={parseInt(projectStat.value, 10)} suffix="+" /></h2></div><p>{copy.portfolio.archive.lead}</p></Reveal>
      <div className="pb-archive-filter"><span>{copy.portfolio.filters.find(item => item.key === category)?.label}의 기록</span>{category !== "all" && <button onClick={() => setCategory("all")} className="site-link">전체 보기 ›</button>}</div>
      {archive.map(group => <section key={group.year} className="pb-year" aria-labelledby={`year-${group.year}`}><h3 id={`year-${group.year}`}>{group.year}<span>{group.items.length}개 프로젝트</span></h3><ul>{group.items.map((item, index) => <li key={`${item.title}-${index}`}><span className="pb-month">{item.month}</span><p>{item.title}</p><span className="pb-archive-chip">{item.category}</span></li>)}</ul></section>)}
      {archive.length === 0 && <p className="b-empty-inline">이 분류의 아카이브가 아직 없습니다.</p>}
    </div></section>
    <section className="site-section b-closing"><Reveal><h2 className="site-headline">{text.inquiry}</h2><Link href="/support/b2b" className="site-pill">{copy.home.closing.primaryCta} <span aria-hidden="true">›</span></Link></Reveal></section>
  </article>;
}
