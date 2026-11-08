import { SiteText } from "@/components/site/SiteText";
import { useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { copy } from "@/content/copy";
import { PageHead, PageSection, Subpage, WaysCards } from "@/components/site/PagePrimitives";
import "./support/team-c.css";

const faqItems = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  function keyboard(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === "ArrowDown") next = (index + 1) % faqItems.length;
    else if (event.key === "ArrowUp") next = (index + faqItems.length - 1) % faqItems.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = faqItems.length - 1;
    else return;
    event.preventDefault();
    buttons.current[next]?.focus();
  }
  return <PageSection className="c-faq-section" eyebrow={<SiteText k="support.faq.eyebrow" />} title={<SiteText k="support.faq.title" />}>
    <div className="c-faq-list">{faqItems.map((item, i) => <div className="c-faq-item" key={item}>
      <h3><button ref={element => { buttons.current[i] = element; }} id={`faq-question-${i}`} type="button" aria-expanded={open === i} aria-controls={`faq-answer-${i}`} onClick={() => setOpen(open === i ? null : i)} onKeyDown={event => keyboard(event, i)}><SiteText k={`support.faq.item${item}.question`} /><span className="c-faq-plus" data-open={open === i}><Plus size={24} aria-hidden="true" /></span></button></h3>
      <div className="c-faq-answer" id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`} hidden={open !== i}>
        {open === i && <motion.p initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}><SiteText k={`support.faq.item${item}.answer`} /></motion.p>}
      </div>
    </div>)}</div>
  </PageSection>;
}

export default function Support() {
  const contact = copy.support.contact;
  return <Subpage className="team-c c-support">
    <PageHead eyebrow={<SiteText k="support.hero.eyebrow" />} title={<SiteText k="support.hero.title" />} intro={<SiteText k="support.hero.lead" />} actions={<a className="btn btn-o" href="#support-contact"><SiteText k="support.hero.link" /></a>} />
    <WaysCards className="c-support-ways" title={<SiteText k="support.cards.title" />} items={([1, 2] as const).map((item, index) => ({ href: copy.support.cards[index].href, title: <SiteText k={`support.cards.item${item}.title`} />, lead: <SiteText k={`support.cards.item${item}.lead`} />, label: <SiteText k={`support.cards.item${item}.link`} />, icon: index === 0 ? "business" : "booking" }))} />
    <Faq />
    <PageSection id="support-contact" alt eyebrow={<SiteText k="support.contact.eyebrow" />} title={<SiteText k="support.contact.title" />}>
      <dl className="c-contact-specs"><div><dt>전화 문의</dt><dd><a href={`tel:${contact.phone}`}>{contact.phone}</a></dd></div><div><dt>이메일 문의</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div><div><dt>상담 운영시간</dt><dd>{contact.hours}</dd></div></dl>
      <div className="c-company-info"><p>{copy.footer.company}</p><p>{copy.footer.address}</p><p>사업자등록번호 {copy.footer.bizNo}</p></div>
    </PageSection>
  </Subpage>;
}
