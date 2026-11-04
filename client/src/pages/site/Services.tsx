import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, ChevronRight, Gift, MapPin, Sparkles, Sprout, Store, Truck } from "lucide-react";
import { copy } from "@/content/copy";
import { milestones, ongoing, projects } from "@/content/brand";
import { useSiteImage } from "@/hooks/useSiteImage";
import { Reveal } from "@/components/site/motion";
import "./support/team-c.css";
import "./services/services.css";

const sections = copy.services.sections;
const navLabels = ["PlantBid", "식물관리", "교육", "조경", "판매"];
const cases = {
  platform: ["simda.me 선물 큐레이션", "동네 화원 상생 네트워크"],
  care: ongoing.plantCare,
  education: projects.filter((p) => /GS칼텍스|신세계 아카데미|HSBC/.test(p.title)).map((p) => p.title),
  landscape: projects.filter((p) => /나인원한남 개인 세대|오페라박물관 조경|삼덕유화/.test(p.title)).map((p) => p.title),
  sales: projects.filter((p) => /난향천리|전체 공간 팝업|슬로웨어/.test(p.title)).map((p) => p.title),
};

function FlowStep({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, [0.04 + index * 0.08, 0.22 + index * 0.08], [0.35, 1]);
  const y = useTransform(progress, [0.04 + index * 0.08, 0.22 + index * 0.08], [14, 0]);
  const Icon = [Store, Truck, Gift][index];
  return <motion.li style={reduce ? undefined : { opacity, y }}>
    <Icon aria-hidden="true" size={28} strokeWidth={1.4} />
    <span className="c-flow-number">0{index + 1}</span>
    <strong>{["동네 화원", "직접 배송", "고객의 일상"][index]}</strong>
  </motion.li>;
}

function ServiceSection({ section, index }: { section: (typeof sections)[number]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const image = useSiteImage(`services.${section.key}`);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.17]);
  const isPlatform = section.key === "platform";
  const external = section.cta.href.startsWith("https:");
  return <section ref={ref} id={section.key} aria-labelledby={`${section.key}-title`} className={`c-service-section ${isPlatform ? "c-service-dark" : index % 2 ? "c-service-light" : "c-service-gray"}`}>
    <div className={`c-service-grid c-wrap ${index % 2 ? "c-service-reverse" : ""}`}>
      <div className="c-service-visual">
        <div className="c-service-photo">
          <motion.img src={image.url} alt={image.alt} loading="lazy" decoding="async" style={reduce ? undefined : { scale }} />
          {isPlatform && <span className="c-photo-caption"><MapPin size={15} aria-hidden="true" /> 가까운 곳에서 전하는 마음</span>}
        </div>
        <p className="c-image-note">서비스 이해를 돕는 이미지</p>
      </div>
      <div className="c-service-copy">
        <Reveal>
          <p className="c-eyebrow">{section.eyebrow}</p>
          <h2 id={`${section.key}-title`}>{section.title}</h2>
          <p className="c-service-lead">{section.lead}</p>
          {isPlatform && <span className="c-patent" title={milestones[0].detail}><Sprout size={16} aria-hidden="true" /> 특허 등록</span>}
        </Reveal>
        {isPlatform && <ol className="c-platform-flow" aria-label="동네 화원에서 고객에게 전달되는 과정">{[0, 1, 2].map((i) => <FlowStep key={i} index={i} progress={scrollYProgress} />)}</ol>}
        <ul className="c-service-points">{section.points.map((point) => <li key={point}><Reveal>{point}</Reveal></li>)}</ul>
        <Reveal className="c-service-cases">
          <h3>{isPlatform ? "가까운 연결" : "함께한 프로젝트"}</h3>
          <ul>{cases[section.key].map((item) => <li key={item}>{item}</li>)}</ul>
        </Reveal>
        <Reveal>{external
          ? <a className="c-button" href={section.cta.href} target="_blank" rel="noopener noreferrer">{section.cta.label}<ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only"> (새 창)</span></a>
          : <Link className="c-button" href={section.cta.href}>{section.cta.label}<ChevronRight size={18} aria-hidden="true" /></Link>}
        </Reveal>
      </div>
    </div>
  </section>;
}

export default function Services() {
  const [active, setActive] = useState<string>("platform");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const marker = Math.min(window.innerHeight * 0.35, 300);
        const current = [...sections].reverse().find((section) => (document.getElementById(section.key)?.getBoundingClientRect().top ?? Infinity) <= marker);
        setActive(current?.key ?? "platform");
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div className="team-c c-services">
    <div className="c-services-intro c-wrap">
      <Reveal><p className="c-eyebrow">심다의 서비스</p><h1>{copy.services.intro.title}</h1><p className="c-intro-lead">{copy.services.intro.lead}</p></Reveal>
    </div>
    <nav className="c-service-nav" aria-label="서비스 바로가기"><div className="c-wrap c-service-nav-inner">
      <span className="c-local-title">서비스</span>
      <div className="c-service-nav-links">{sections.map((section, index) => <a key={section.key} href={`#${section.key}`} aria-current={active === section.key ? "location" : undefined}>{navLabels[index]}</a>)}</div>
    </div></nav>
    {sections.map((section, index) => <ServiceSection key={section.key} section={section} index={index} />)}
    <section className="c-ai-section c-wrap" aria-labelledby="ai-title"><Reveal>
      <Link href="/ai-curation" className="c-ai-card"><span className="c-ai-icon"><Sparkles size={28} strokeWidth={1.4} aria-hidden="true" /></span><div><h2 id="ai-title">식물이 궁금한 순간, AI 큐레이션.</h2><p>취향과 공간에 맞는 식물 이야기를 시작해 보세요.</p><span className="c-text-link">AI 식물 상담 시작하기 <ChevronRight size={16} aria-hidden="true" /></span></div></Link>
    </Reveal></section>
  </div>;
}
