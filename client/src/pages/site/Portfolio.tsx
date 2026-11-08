import { SiteText } from "@/components/site/SiteText";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PageHead, PageSection, PhotoTile, SegmentedControl, Subpage } from "@/components/site/PagePrimitives";
import { copy } from "@/content/copy";
import { projects } from "@/content/brand";
import { categoryKey, categoryLabel, usePortfolios } from "./portfolio/data";
import { PageState, usePageTitle, yearOf } from "./portfolio/ui";
import "./portfolio/portfolio.css";

export default function Portfolio() {
  usePageTitle(copy.seo["/portfolio"].title);
  const { data = [], isPending, isError, refetch } = usePortfolios();
  const [category, setCategory] = useState("all");
  const reduce = useReducedMotion();
  const visible = data.filter(item => category === "all" || categoryKey(item.category) === category);
  const archive = useMemo(() => {
    const filtered = projects.filter(item => category === "all" || categoryKey(item.category) === category);
    return Array.from(new Set(filtered.map(item => item.year))).sort((a, b) => b - a).map(year => ({ year, items: filtered.filter(item => item.year === year) }));
  }, [category]);
  return <Subpage className="portfolio-page">
    <PageHead eyebrow={<SiteText k="portfolio.hero.eyebrow" />} title={<SiteText k="portfolio.hero.title" />} intro={<SiteText k="portfolio.hero.lead" />} imageKey="portfolio.hero" actions={<a href="#portfolio-work" className="btn"><SiteText k="portfolio.hero.link" /></a>} />
    <PageSection id="portfolio-work" eyebrow={<SiteText k="portfolio.work.eyebrow" />} title={<SiteText k="portfolio.work.title" />} intro={<SiteText k="portfolio.work.lead" />}>
      <SegmentedControl label="프로젝트 카테고리" options={copy.portfolio.filters} value={category} onChange={setCategory} />
      <p className="b-result-count" role="status" aria-live="polite">{isPending ? "프로젝트를 불러오는 중" : isError ? "프로젝트 사진을 불러오지 못했습니다" : `${visible.length}개의 프로젝트`} · 아카이브 {archive.reduce((sum, group) => sum + group.items.length, 0)}건</p>
      {isPending ? <PageState title="작업의 기록을 불러옵니다" loading /> : isError ? <PageState title="프로젝트 사진을 불러오지 못했습니다." detail="아래 아카이브는 계속 둘러볼 수 있습니다." retry={() => refetch()} /> : <>
        <motion.div layout={!reduce} className="sp-tiles pb-grid"><AnimatePresence initial={false} mode="popLayout">{visible.map(item => <motion.div layout={!reduce} key={item.id} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
          <PhotoTile item={{ id: item.id, href: `/portfolio/${encodeURIComponent(item.id)}`, title: item.title, eyebrow: [categoryLabel(item.category), yearOf(item.completedDate)].filter(Boolean).join(" · "), image: item.thumbnailUrl || item.images?.[0] }} />
        </motion.div>)}</AnimatePresence></motion.div>
        {visible.length === 0 && <PageState title="이 분류의 프로젝트 사진을 준비하고 있습니다." detail="아래 아카이브에서 심다의 작업 기록을 만나보세요.">{category !== "all" && <button className="sp-link" onClick={() => setCategory("all")}>전체 작업 보기 ›</button>}</PageState>}
      </>}
    </PageSection>
    <PageSection id="portfolio-archive" eyebrow={<SiteText k="portfolio.archive.eyebrow" />} title={<SiteText k="portfolio.archive.title" />} intro={<SiteText k="portfolio.archive.lead" />} alt>
      <div className="pb-archive-filter"><span>{copy.portfolio.filters.find(item => item.key === category)?.label}의 기록</span>{category !== "all" && <button onClick={() => setCategory("all")} className="sp-link"><SiteText k="portfolio.archive.reset" /> ›</button>}</div>
      {archive.map(group => <section key={group.year} className="pb-year" aria-labelledby={`year-${group.year}`}><h3 id={`year-${group.year}`}>{group.year}<span>{group.items.length}개 프로젝트</span></h3><ul>{group.items.map((item, index) => <li key={`${item.title}-${index}`}><span className="pb-month">{item.month}</span><p>{item.title}</p><span className="pb-archive-category">{item.category}</span></li>)}</ul></section>)}
      {archive.length === 0 && <p className="b-empty-inline">이 분류의 아카이브가 아직 없습니다.</p>}
    </PageSection>
    <PageSection title={<SiteText k="portfolio.closing.title" />} center><div className="sp-actions"><Link href="/support/b2b" className="btn">{<SiteText k="portfolio.closing.primary" />}</Link><Link href="/support/booking" className="btn btn-o"><SiteText k="portfolio.closing.booking" /></Link></div></PageSection>
  </Subpage>;
}
