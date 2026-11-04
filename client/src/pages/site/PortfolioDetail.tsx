import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ParallaxImage, Reveal } from "@/components/site/motion";
import { copy } from "@/content/copy";
import { categoryLabel, usePortfolios, type PortfolioItem } from "./portfolio/data";
import { ContentImage, MaskTitle, PageState, usePageTitle, yearOf } from "./portfolio/ui";
import "./portfolio/portfolio.css";

export default function PortfolioDetail({ id }: { id: string }) {
  const { data: project, isPending, isError, error, refetch } = useQuery<PortfolioItem>({ queryKey: [`/api/portfolios/${encodeURIComponent(id)}`] });
  const { data: all = [] } = usePortfolios();
  usePageTitle(project ? `${project.title} — 심다 포트폴리오` : "프로젝트 — 심다");
  if (isPending) return <div className="team-b"><PageState heading={1} title="프로젝트를 불러옵니다" loading /></div>;
  if (isError || !project) return <div className="team-b"><PageState heading={1} title={error?.message.startsWith("404") ? "프로젝트를 찾을 수 없습니다." : "프로젝트를 불러오지 못했습니다."} retry={isError && !error?.message.startsWith("404") ? () => refetch() : undefined}><Link href="/portfolio" className="site-link">포트폴리오로 돌아가기 ›</Link></PageState></div>;
  const current = all.findIndex(item => item.id === id);
  const next = all.length > 1 && current >= 0 ? all[(current + 1) % all.length] : all.find(item => item.id !== id);
  const cover = project.thumbnailUrl || project.images?.[0];
  const images = (project.images || []).filter(Boolean);
  return <article className="team-b pb-detail" key={id}>
    <header className="site-container pb-detail-top"><Link href="/portfolio" className="b-back site-link"><span aria-hidden="true">‹</span> 모든 프로젝트</Link><p className="b-kicker">{categoryLabel(project.category)}</p><MaskTitle text={project.title} /></header>
    {cover ? <ParallaxImage src={cover} alt={project.title} loading="eager" strength={6} containerClassName="pb-detail-cover" /> : <div className="pb-detail-cover"><ContentImage alt={project.title} /></div>}
    <section className="site-container site-section pb-detail-info" aria-labelledby="project-description"><Reveal><dl className="pb-meta"><div><dt>연도</dt><dd>{yearOf(project.completedDate) || "—"}</dd></div><div><dt>클라이언트</dt><dd>{project.clientName || "—"}</dd></div><div><dt>분류</dt><dd>{categoryLabel(project.category)}</dd></div></dl></Reveal><Reveal className="pb-description"><h2 id="project-description">공간에 담은 이야기</h2><p>{project.description || "프로젝트 이야기를 준비하고 있습니다."}</p></Reveal></section>
    {images.length > 0 && <section className="pb-sequence" aria-label="프로젝트 사진">{images.map((src, index) => <Reveal key={`${id}-${index}`} className={index % 3 === 0 || index === images.length - 1 && index % 3 === 1 ? "pb-sequence-wide" : ""}><figure><ContentImage src={src} alt={`${project.title} — 공간 사진 ${index + 1}`} /><figcaption>{project.title} <span aria-hidden="true">/</span> {String(index + 1).padStart(2, "0")}</figcaption></figure></Reveal>)}</section>}
    {next ? <section className="pb-next" aria-labelledby="next-project"><Link href={`/portfolio/${encodeURIComponent(next.id)}`} className="pb-next-link"><ContentImage src={next.thumbnailUrl || next.images?.[0]} alt={next.title} /><div className="pb-tile-shade" /><div className="pb-next-content"><p>{copy.portfolio.next.label}</p><h2 id="next-project">{next.title}</h2><span>프로젝트 살펴보기 <span aria-hidden="true">↗</span></span></div></Link></section> : <section className="b-closing site-section"><h2 className="site-headline">다음 공간을 함께 만듭니다.</h2><Link href="/support/b2b" className="site-pill">{copy.home.closing.primaryCta} ›</Link></section>}
  </article>;
}
