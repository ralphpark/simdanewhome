import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Timeline } from "@shared/schema";
import { PageHead, PageSection, PhotoReveal, ScrollReveal, WaysCards } from "@/components/site/PagePrimitives";
import { awards, founder, media, milestones } from "@/content/brand";
import { copy } from "@/content/copy";
import { useSiteImage } from "@/hooks/useSiteImage";

export function StoryOpening() {
  return <PageHead eyebrow={copy.nav.story} title={<>국내 1호<br />식물 큐레이터.</>} intro={<p>{copy.story.opening.lead}</p>} imageKey="story.opening" actions={<Link href="/services" className="btn">서비스 알아보기</Link>} />;
}

export function StoryPhilosophy() {
  const image = useSiteImage("story.philosophy");
  return <PageSection id="story-philosophy" eyebrow="심다 = 심고 + 초심" title="풀의 마음과 처음의 마음." className="story-philosophy">
    <div className="story-philosophy-copy">
      <ScrollReveal><p className="t-intro"><b>심다는 땅에 생명을 심는 일과 본래의 시작을 돌아보는 초심(初心)</b>에서 출발했습니다. 풀의 마음으로 곁을 살피고 처음의 마음으로 공간에 온기를 채웁니다.</p></ScrollReveal>
      <ScrollReveal><p className="t-intro">살아 숨 쉬는 식물과 사람이 자연스럽게 조화를 이루는 일상을 제안합니다. <b>식물이 지닌 고유한 생명력을 일상의 영역으로 단정하게 확장합니다.</b></p><p className="story-founder">{founder.title} · {founder.name} 대표</p></ScrollReveal>
    </div>
    <PhotoReveal src={image.url} alt={image.alt} aspectRatio="16/9" />
  </PageSection>;
}

type StoryEvent = { date: string; title: string; detail?: string };
type StoryYear = { year: number; events: StoryEvent[] };
function groupTimeline(events: StoryEvent[]): StoryYear[] {
  const groups = new Map<number, StoryEvent[]>();
  events.forEach(event => {
    const years = event.date.match(/\d{4}/g);
    if (!years?.length) return;
    // A multi-year recognition keeps its source date and is grouped at its final year.
    const year = Number(years[years.length - 1]);
    groups.set(year, [...(groups.get(year) ?? []), event]);
  });
  return Array.from(groups, ([year, entries]) => ({ year, events: entries.sort((a, b) => a.date.localeCompare(b.date)) })).sort((a, b) => a.year - b.year);
}
const fallbackTimeline = groupTimeline([
  { date: "2016.04", title: "심다(simda) 창업", detail: "국내 1호 식물 큐레이터 이주연의 시작" },
  ...milestones,
]);

export function StoryTimeline() {
  const { data = [] } = useQuery<Timeline[]>({ queryKey: ["/api/timelines"] });
  const timeline = useMemo(() => {
    const records = groupTimeline(data.map(item => ({ date: item.year, title: item.title, detail: item.description })));
    return records.length ? records : fallbackTimeline;
  }, [data]);
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(timeline[0].year);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      let current = timeline[0].year;
      ref.current?.querySelectorAll<HTMLElement>("[data-story-year]").forEach(element => {
        if (element.getBoundingClientRect().top <= window.innerHeight * .45) current = Number(element.dataset.storyYear);
      });
      setActive(current);
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [timeline]);
  return <PageSection id="story-timeline" alt eyebrow="심다의 시간" title={copy.story.timeline.title} intro={copy.story.timeline.lead}>
    <div ref={ref} className="story-timeline-grid">
      <div className="story-year-column" aria-hidden="true"><div className="story-year-sticky"><span className="story-year-label">식물과 함께 쌓아온 시간</span><span className="story-active-year">{active}</span><span className="story-year-range">{timeline[0].year} — {timeline[timeline.length - 1].year}</span></div></div>
      <div className="story-events">{timeline.map(({ year, events }) => <section className="story-year-group" key={year} data-story-year={year} aria-labelledby={`story-year-${year}`}>
        <h3 id={`story-year-${year}`}>{year}</h3><ul>{events.map((event, index) => <li key={`${event.date}-${index}`}><ScrollReveal><span className="story-event-date">{event.date}</span><h4>{event.title}</h4>{event.detail && <p>{event.detail}</p>}</ScrollReveal></li>)}</ul>
      </section>)}</div>
    </div>
  </PageSection>;
}

const patents = milestones.filter(item => item.tag === "PATENT");
const certificates = milestones.filter(item => item.tag === "CERT" && item.date !== "2021.11.11");
const numbers = [{ value: "100+", label: "대외 프로젝트" }, { value: "3", label: "등록특허" }, { value: "2", label: "공식 수상" }, { value: "5억", label: "연구개발 자금 확보" }];
export function StoryRecognition() {
  return <PageSection id="story-recognition" eyebrow="숫자로 보는 심다" title="꾸준함이 만든 기록." intro={copy.story.recognition.lead}>
    <div className="story-numbers">{numbers.map(item => <ScrollReveal key={item.label} className="story-number"><strong>{item.value}</strong><p>{item.label}</p></ScrollReveal>)}</div>
    <div className="story-bento">
      {patents.map(item => <ScrollReveal key={item.date} className="story-record"><div className="story-record-top"><span className="story-badge">등록특허</span><span>{item.date.slice(0, 4)}</span></div><h3>{item.detail?.split(" (등록번호")[0] ?? item.title}</h3><p>{item.detail?.match(/등록번호 ([^)]+)/)?.[1]}</p></ScrollReveal>)}
      <ScrollReveal className="story-record story-certificates"><div className="story-record-top"><span className="story-badge">공인 인증</span></div><h3>지속적인 성장을 위한 기반.</h3><ul>{certificates.map(item => <li key={item.date}><span>{item.date.slice(0, 4)}</span>{item.title}</li>)}</ul></ScrollReveal>
      {awards.map(item => <ScrollReveal key={item.title} className="story-record"><div className="story-record-top"><span className="story-badge story-badge-award">수상</span><span>{item.date.slice(0, 4)}</span></div><h3>{item.title}</h3><p>{item.org}</p></ScrollReveal>)}
    </div>
  </PageSection>;
}

export function StoryMedia() {
  return <PageSection id="story-media" alt eyebrow="식물과 삶을 잇는 이야기" title={copy.story.media.title}>
    <ul className="story-media-list">{media.map(item => <li key={`${item.date}-${item.outlet}`}><ScrollReveal className="story-media-row"><span className="story-media-date">{item.date}</span><h3>{item.outlet}</h3><p>{item.title}</p></ScrollReveal></li>)}</ul>
  </PageSection>;
}

export function StoryClosing() { return <WaysCards />; }
