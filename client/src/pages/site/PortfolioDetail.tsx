import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PageSection, PhotoReveal, ScrollReveal, Subpage, Tiles } from "@/components/site/PagePrimitives";
import { copy } from "@/content/copy";
import { categoryLabel, usePortfolios, type PortfolioItem } from "./portfolio/data";
import { PageState, usePageTitle, yearOf } from "./portfolio/ui";
import "./portfolio/portfolio.css";

export default function PortfolioDetail({ id }: { id: string }) {
  const { data: project, isPending, isError, error, refetch } = useQuery<PortfolioItem>({ queryKey: [`/api/portfolios/${encodeURIComponent(id)}`] });
  const { data: all = [] } = usePortfolios();
  usePageTitle(project ? `${project.title} — 심다 포트폴리오` : "프로젝트 — 심다");
  if (isPending) return <Subpage><PageState heading={1} title="프로젝트를 불러옵니다" loading /></Subpage>;
  if (isError || !project) return <Subpage><PageState heading={1} title={error?.message.startsWith("404") ? "프로젝트를 찾을 수 없습니다." : "프로젝트를 불러오지 못했습니다."} retry={isError && !error?.message.startsWith("404") ? () => refetch() : undefined}><Link href="/portfolio" className="sp-link">포트폴리오로 돌아가기 ›</Link></PageState></Subpage>;
  const current = all.findIndex(item => item.id === id);
  const next = all.length > 1 && current >= 0 ? all[(current + 1) % all.length] : all.find(item => item.id !== id);
  const cover = project.thumbnailUrl || project.images?.[0];
  const images = (project.images || []).filter(Boolean);
  const intro = project.description?.trim().match(/^[^\n.!?]+[.!?]?/)?.[0] || "프로젝트 이야기를 준비하고 있습니다.";
  return <Subpage className="pb-detail" key={id}>
    <div className="sp-wrap pb-detail-top"><Link href="/portfolio" className="b-back sp-link">‹ 모든 프로젝트</Link>
      <header className="pb-detail-heading"><p className="t-eye">{categoryLabel(project.category)}</p><h1>{project.title}</h1><p className="t-intro">{intro}</p></header>
      <PhotoReveal src={cover} alt={project.title} eager aspectRatio="16/10" />
    </div>
    <PageSection className="pb-detail-info">
      <ScrollReveal className="pb-description"><p className="t-intro">{project.description || "프로젝트 이야기를 준비하고 있습니다."}</p></ScrollReveal>
      <ScrollReveal><dl className="pb-meta"><div><dt>연도</dt><dd>{yearOf(project.completedDate) || "—"}</dd></div><div><dt>클라이언트</dt><dd>{project.clientName || "—"}</dd></div><div><dt>분류</dt><dd>{categoryLabel(project.category)}</dd></div></dl></ScrollReveal>
    </PageSection>
    {images.length > 0 && <PageSection alt className="pb-sequence"><div aria-label="프로젝트 사진">{images.map((src, index) => <PhotoReveal key={`${id}-${index}`} src={src} alt={`${project.title} — 공간 사진 ${index + 1}`} caption={<>{project.title} <span aria-hidden="true">/</span> {String(index + 1).padStart(2, "0")}</>} />)}</div></PageSection>}
    {next ? <PageSection eyebrow={copy.portfolio.next.label} title="또 다른 공간의 이야기."><Tiles className="pb-next" items={[{ id: next.id, href: `/portfolio/${encodeURIComponent(next.id)}`, title: next.title, eyebrow: categoryLabel(next.category), image: next.thumbnailUrl || next.images?.[0] }]} /></PageSection> : <PageSection title="다음 공간을 함께 만듭니다." center><div className="sp-actions"><Link href="/support/b2b" className="btn">{copy.home.closing.primaryCta}</Link></div></PageSection>}
  </Subpage>;
}
