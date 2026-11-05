import { useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { copy } from "@/content/copy";
import { PageHead, PageSection, Subpage, WaysCards } from "@/components/site/PagePrimitives";
import "./support/team-c.css";

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  function keyboard(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === "ArrowDown") next = (index + 1) % copy.support.faq.length;
    else if (event.key === "ArrowUp") next = (index + copy.support.faq.length - 1) % copy.support.faq.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = copy.support.faq.length - 1;
    else return;
    event.preventDefault();
    buttons.current[next]?.focus();
  }
  return <PageSection className="c-faq-section" eyebrow="궁금한 점을 먼저 살펴보세요." title="자주 묻는 질문.">
    <div className="c-faq-list">{copy.support.faq.map((item, i) => <div className="c-faq-item" key={item.q}>
      <h3><button ref={element => { buttons.current[i] = element; }} id={`faq-question-${i}`} type="button" aria-expanded={open === i} aria-controls={`faq-answer-${i}`} onClick={() => setOpen(open === i ? null : i)} onKeyDown={event => keyboard(event, i)}>{item.q}<span className="c-faq-plus" data-open={open === i}><Plus size={24} aria-hidden="true" /></span></button></h3>
      <div className="c-faq-answer" id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} hidden={open !== i}>
        {open === i && <motion.p initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>{item.a}</motion.p>}
      </div>
    </div>)}</div>
  </PageSection>;
}

export default function Support() {
  const contact = copy.support.contact;
  return <Subpage className="team-c c-support">
    <PageHead eyebrow="고객센터" title={copy.support.hero.title} intro={copy.support.hero.lead} actions={<a className="btn btn-o" href="#support-contact">심다에 연락하기</a>} />
    <WaysCards className="c-support-ways" title="함께 시작하는 방법." items={copy.support.cards.map((card, index) => ({ ...card, label: index === 0 ? "협업 제안하기" : "상담 일정 선택하기", icon: index === 0 ? "business" : "booking" }))} />
    <Faq />
    <PageSection id="support-contact" alt eyebrow="심다에 연락하기" title="편안하게 이야기해 주세요.">
      <dl className="c-contact-specs"><div><dt>전화 문의</dt><dd><a href={`tel:${contact.phone}`}>{contact.phone}</a></dd></div><div><dt>이메일 문의</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div><div><dt>상담 운영시간</dt><dd>{contact.hours}</dd></div></dl>
      <div className="c-company-info"><p>{copy.footer.company}</p><p>{copy.footer.address}</p><p>사업자등록번호 {copy.footer.bizNo}</p></div>
    </PageSection>
  </Subpage>;
}
