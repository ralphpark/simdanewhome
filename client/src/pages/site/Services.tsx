import type { CSSProperties } from "react";
import { SiteText } from "@/components/site/SiteText";
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
  platform: [],
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
  return <PageSection id={section.key} alt={index % 2 === 0} eyebrow={<SiteText k={`services.${section.key}.eyebrow`} />} title={<SiteText k={`services.${section.key}.title`} />} intro={<p><SiteText k={`services.${section.key}.lead`} /></p>} className="service-section">
    {isPlatform ? <div className="service-platform-visual"><PhotoReveal src={image.url} alt={image.alt} aspectRatio="4/5" /><div className="service-phone-card"><PlatformPhone /><p className="service-phone-caption"><SiteText k="services.platform.caption" /></p></div></div> : <PhotoReveal src={image.url} alt={image.alt} aspectRatio="16/9" />}
    <div className="service-details">
      <ScrollReveal className="service-features">
        {isPlatform && <span className="service-patent" title={platformPatent?.detail}><SiteText k="services.platform.badge" /></span>}
        <h3><SiteText k={`services.${section.key}.featuresTitle`} /></h3>
        <ul>{([1, 2, 3] as const).map(point => <li key={point}><SiteText k={`services.${section.key}.point${point}`} /></li>)}</ul>
        <div className="service-actions">{external ? <a className="btn" href={section.cta.href} target="_blank" rel="noopener"><SiteText k={`services.${section.key}.link`} /> ↗<span className="sr-only"> (새 창)</span></a> : <Link className="btn" href={section.cta.href}><SiteText k={`services.${section.key}.link`} /></Link>}<Link className="sp-link" href="/portfolio"><SiteText k={`services.${section.key}.portfolioLink`} /> <span aria-hidden="true">›</span></Link></div>
      </ScrollReveal>
      <ScrollReveal className="service-cases"><h3><SiteText k={`services.${section.key}.casesTitle`} /></h3><ul>{isPlatform ? ([1, 2] as const).map(i => <li key={i}><SiteText k={`services.platform.case${i}`} /></li>) : cases[section.key].map(item => <li key={item}>{item}</li>)}</ul>{section.key === "landscape" && <p className="service-case-note">{ongoing.landscapeCare.slice(0, 3).join(" · ")}의 정원을 지속적으로 관리합니다.</p>}</ScrollReveal>
    </div>
  </PageSection>;
}

export default function Services() {
  usePageTitle("서비스 | 심다");
  return <Subpage className="services-page">
    <PageHead eyebrow={<SiteText k="services.hero.eyebrow" />} title={<SiteText k="services.hero.title" />} intro={<p><SiteText k="services.hero.lead" /></p>} imageKey="services.platform" actions={<Link className="btn" href="/support/booking"><SiteText k="services.hero.link" /></Link>} />
    {sections.map((section, index) => <ServiceSection key={section.key} section={section} index={index} />)}
    <PageSection eyebrow={<SiteText k="services.clients.eyebrow" />} title={<SiteText k="services.clients.title" />} intro={<SiteText k="services.clients.lead" />} className="service-clients">
      <ul>{clients.map(({ name, logo }) => <li key={name}>
        <div className="service-client-mark">{logo
          ? <img src={logo.file} alt={name} width={logo.w} height={logo.h} loading="lazy" decoding="async" style={{ "--client-logo-w": `${logo.w}px`, "--client-logo-h": `${logo.h}px` } as CSSProperties} />
          : <span>{name}</span>}
        </div>
      </li>)}</ul>
    </PageSection>
    <PageSection alt eyebrow={<SiteText k="services.ai.eyebrow" />} title={<SiteText k="services.ai.title" />} intro={<p><SiteText k="services.ai.body" /></p>} center className="service-ai"><Link href="/ai-curation" className="btn"><SiteText k="services.ai.link" /></Link></PageSection>
  </Subpage>;
}
