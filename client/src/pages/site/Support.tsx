import { useRef, useState, type KeyboardEvent } from "react";
import { Link } from "wouter";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Building2, CalendarDays, ChevronRight, Clock3, Mail, Phone, Plus } from "lucide-react";
import { copy } from "@/content/copy";
import { useSiteImage } from "@/hooks/useSiteImage";
import { ParallaxImage, Reveal, Stagger, siteEase } from "@/components/site/motion";
import "./support/team-c.css";

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const keyboard = (event: KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowDown") next = (index + 1) % copy.support.faq.length;
    else if (event.key === "ArrowUp") next = (index + copy.support.faq.length - 1) % copy.support.faq.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = copy.support.faq.length - 1;
    else return;
    event.preventDefault();
    buttons.current[next]?.focus();
  };
  return <section className="c-faq-section c-wrap" aria-labelledby="faq-title">
    <div className="c-faq-intro"><h2 id="faq-title">자주 묻는 질문.</h2><p>궁금한 점을 먼저 살펴보세요.</p></div>
    <LayoutGroup><div className="c-faq-list">{copy.support.faq.map((item, i) => <motion.div layout={reduce ? false : "position"} transition={{ duration: reduce ? 0 : 0.35, ease: siteEase }} className="c-faq-item" key={item.q}>
      <h3><button ref={(el) => { buttons.current[i] = el; }} id={`faq-question-${i}`} type="button" aria-expanded={open === i} aria-controls={`faq-answer-${i}`} onClick={() => setOpen(open === i ? null : i)} onKeyDown={(e) => keyboard(e, i)}>{item.q}<motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: reduce ? 0 : 0.25 }}><Plus size={21} aria-hidden="true" /></motion.span></button></h3>
      <motion.div layout={reduce ? false : true} transition={{ duration: reduce ? 0 : 0.35, ease: siteEase }} className="c-faq-answer" id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} hidden={open !== i}>
        {open === i && <motion.p initial={reduce ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.35 }}>{item.a}</motion.p>}
      </motion.div>
    </motion.div>)}</div></LayoutGroup>
  </section>;
}

export default function Support() {
  const image = useSiteImage("support.hero");
  const contact = copy.support.contact;
  return <div className="team-c c-support">
    <section className="c-support-hero c-wrap">
      <Reveal className="c-support-hero-copy"><p className="c-eyebrow">고객센터</p><h1>{copy.support.hero.title}</h1><p className="c-intro-lead">{copy.support.hero.lead}</p><a className="c-text-link" href="#support-contact">심다에 연락하기 <ChevronRight size={18} aria-hidden="true" /></a></Reveal>
      <ParallaxImage src={image.url} alt={image.alt} containerClassName="c-support-hero-photo" strength={5} />
    </section>
    <div id="support-contact" className="c-contact-band"><div className="c-wrap c-contact-grid">
      <a href={`tel:${contact.phone}`}><Phone size={24} strokeWidth={1.5} aria-hidden="true" /><span>전화 문의<strong>{contact.phone}</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a>
      <a href={`mailto:${contact.email}`}><Mail size={24} strokeWidth={1.5} aria-hidden="true" /><span>이메일 문의<strong>{contact.email}</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a>
      <div><Clock3 size={24} strokeWidth={1.5} aria-hidden="true" /><span>상담 운영시간<strong>{contact.hours}</strong></span></div>
    </div></div>
    <section className="c-support-paths c-wrap" aria-labelledby="support-paths-title">
      <Reveal><h2 className="c-heading" id="support-paths-title">함께 시작하는 방법.</h2></Reveal>
      <Stagger className="c-support-cards">{copy.support.cards.map((card, i) => { const Icon = i === 0 ? Building2 : CalendarDays; return <Reveal key={card.href}><Link href={card.href} className={`c-support-card ${i === 0 ? "c-support-card-dark" : ""}`}>
        <Icon size={36} strokeWidth={1.2} aria-hidden="true" /><h3>{card.title}</h3><p>{card.lead}</p><span className="c-card-action">{i === 0 ? "협업 제안하기" : "상담 일정 선택하기"}<ChevronRight size={18} aria-hidden="true" /></span>
      </Link></Reveal>; })}</Stagger>
    </section>
    <Faq />
    <section className="c-company-band" aria-label="회사 정보"><div className="c-wrap"><h2>{copy.footer.company}</h2><p>{copy.footer.address}</p><p>사업자등록번호 {copy.footer.bizNo}</p></div></section>
  </div>;
}
