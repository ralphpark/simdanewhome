import { Link } from "wouter";
import { PageHead, PageSection, PhotoReveal, ScrollReveal, Subpage } from "@/components/site/PagePrimitives";
import { PlatformPhone } from "@/components/site/PlatformPhone";
import { copy } from "@/content/copy";
import { clients, milestones, ongoing, projects } from "@/content/brand";
import { useSiteImage } from "@/hooks/useSiteImage";
import { usePageTitle } from "./portfolio/ui";
import "./services/services.css";

const sections = copy.services.sections;
const cases = {
  platform: sections[0].cases.slice(0, 2),
  care: ongoing.plantCare,
  education: projects.filter(item => /GS칼텍스|신세계 아카데미|HSBC/.test(item.title)).map(item => item.title),
  landscape: projects.filter(item => /나인원한남 개인 세대|오페라박물관 조경|삼덕유화/.test(item.title)).map(item => item.title),
  sales: projects.filter(item => /난향천리|전체 공간 팝업|슬로웨어/.test(item.title)).map(item => item.title),
};
const platformPatent = milestones.find(item => item.tag === "PATENT" && item.detail?.includes("위치"));

function ServiceSection({ section, index }: { section: (typeof sections)[number]; index: number }) {
  const image = useSiteImage(`services.${section.key}`);
  const isPlatform = section.key === "platform";
  const external = section.cta.href.startsWith("https:");
  return <PageSection id={section.key} alt={index % 2 === 0} eyebrow={section.eyebrow} title={section.title} intro={<p><b>{section.lead.split(" ").slice(0, 3).join(" ")}</b> {section.lead.split(" ").slice(3).join(" ")}</p>} className="service-section">
    {isPlatform ? <div className="service-platform-visual"><PhotoReveal src={image.url} alt={image.alt} aspectRatio="4/5" /><div className="service-phone-card"><PlatformPhone /><p className="service-phone-caption">가까운 동네 가게에서, 소중한 사람에게.</p></div></div> : <PhotoReveal src={image.url} alt={image.alt} aspectRatio="16/9" />}
    <div className="service-details">
      <ScrollReveal className="service-features">
        {isPlatform && <span className="service-patent" title={platformPatent?.detail}>특허 등록 · 위치 기반 플랫폼</span>}
        <h3>{isPlatform ? "동네와 일상을 잇는 기술." : "심다가 함께하는 방법."}</h3>
        <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>
        <div className="service-actions">{external ? <a className="btn" href={section.cta.href} target="_blank" rel="noopener">{section.cta.label} ↗<span className="sr-only"> (새 창)</span></a> : <Link className="btn" href={section.cta.href}>{section.cta.label}</Link>}<Link className="sp-link" href="/portfolio">포트폴리오 더 알아보기 <span aria-hidden="true">›</span></Link></div>
      </ScrollReveal>
      <ScrollReveal className="service-cases"><h3>{isPlatform ? "가까운 연결" : "함께한 프로젝트"}</h3><ul>{cases[section.key].map(item => <li key={item}>{item}</li>)}</ul>{section.key === "landscape" && <p className="service-case-note">{ongoing.landscapeCare.slice(0, 3).join(" · ")}의 정원을 지속적으로 관리합니다.</p>}</ScrollReveal>
    </div>
  </PageSection>;
}

export default function Services() {
  usePageTitle("서비스 | 심다");
  return <Subpage className="services-page">
    <PageHead eyebrow="심다의 서비스" title={copy.services.intro.title} intro={<p>{copy.services.intro.lead}</p>} imageKey="services.platform" actions={<Link className="btn" href="/support/booking">나에게 맞는 서비스 상담</Link>} />
    {sections.map((section, index) => <ServiceSection key={section.key} section={section} index={index} />)}
    <PageSection eyebrow="함께한 곳" title="다양한 공간에서, 같은 마음으로." intro="기업과 기관, 동네 가게와 개인의 일상까지 식물과 함께할 방법을 찾습니다." className="service-clients"><ul>{clients.map(client => <li key={client}>{client}</li>)}</ul></PageSection>
    <PageSection alt eyebrow="AI 큐레이션" title="식물이 궁금한 순간." intro={<p>취향과 공간에 맞는 <b>식물 이야기를 시작해 보세요.</b></p>} center className="service-ai"><Link href="/ai-curation" className="btn">AI 식물 상담 시작하기</Link></PageSection>
  </Subpage>;
}
