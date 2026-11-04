import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, Award, ShieldCheck, Sprout } from "lucide-react";
import { ParallaxImage, Reveal } from "@/components/site/motion";
import { awards, founder, media, milestones, projects } from "@/content/brand";
import { copy } from "@/content/copy";
import { useSiteImage } from "@/hooks/useSiteImage";

const text = { philosophy: "풀의 마음과 처음의 마음", equation: "심다 = 심고 + 초심", closing: "함께 시작하기", timelineEnd: "식물과 함께, 다음으로.", recognition: "인정받은 기록" };

export function StoryOpening() {
  const image = useSiteImage("story.opening");
  return <section className="a-story-opening" aria-labelledby="story-title">
    <div className="site-container a-story-opening-copy"><Reveal><p className="a-story-kicker">{copy.nav.story}</p><h1 id="story-title">국내 1호<br />식물 큐레이터.</h1><div className="a-story-opening-detail"><p>{copy.story.opening.lead}</p><span>{founder.name} 대표</span></div></Reveal><a className="a-story-scroll" href="#story-philosophy" aria-label="심다의 철학으로 이동"><ArrowDown size={22} aria-hidden="true" /></a></div>
    <ParallaxImage src={image.url} alt={image.alt} loading="eager" fetchPriority="high" strength={6} containerClassName="a-story-opening-photo" />
  </section>;
}

function RevealWord({ word, index, total, progress, reduce }: { word: string; index: number; total: number; progress: MotionValue<number>; reduce: boolean }) {
  const start = 0.05 + index / total * 0.78;
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  return <span className="a-story-word"><span>{word}</span><motion.span className="a-story-word-lit" style={{ opacity: reduce ? 1 : opacity }} aria-hidden="true">{word}</motion.span></span>;
}

export function StoryPhilosophy() {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = text.philosophy.split(" ");
  const body = copy.story.philosophy.body.split(" ");
  return <section ref={ref} id="story-philosophy" className="a-story-philosophy" aria-labelledby="story-philosophy-title"><div className="a-story-philosophy-sticky"><div className="site-container">
    <p className="a-story-equation">{text.equation}</p>
    <h2 id="story-philosophy-title"><span className="sr-only">{text.philosophy}</span><span aria-hidden="true" className="a-story-reveal-title">{words.map((word, index) => <RevealWord key={index} word={word} index={index} total={words.length + body.length} progress={scrollYProgress} reduce={reduce} />)}</span></h2>
    <p className="a-story-reveal-body"><span className="sr-only">{copy.story.philosophy.body}</span><span aria-hidden="true">{body.map((word, index) => <RevealWord key={index} word={word} index={index + words.length} total={words.length + body.length} progress={scrollYProgress} reduce={reduce} />)}</span></p>
  </div></div></section>;
}

type StoryEvent = { date: string; title: string; detail?: string };
type StoryYear = { year: number; events: StoryEvent[] };

/** Source dates remain intact. Multi-year selection is shown at its final year. */
function buildTimeline(): StoryYear[] {
  const byYear = new Map<number, StoryEvent[]>();
  function add(year: number, event: StoryEvent) {
    if (year < 2016 || year > 2026) return;
    byYear.set(year, [...(byYear.get(year) ?? []), event]);
  }
  founder.career.forEach(entry => {
    const year = Number(entry.slice(0, 4));
    if (year >= 2016) add(year, { date: entry.slice(0, 7), title: entry.replace(/^.*?현재\s*/, "") });
  });
  milestones.forEach(item => {
    const range = item.date.match(/(\d{4})\s*—\s*(\d{4})/);
    add(Number(range ? range[2] : item.date.slice(0, 4)), item);
  });
  // Earlier years are backed by the same brand archive, not invented milestones.
  for (const year of [2017, 2019]) {
    const project = projects.find(item => item.year === year);
    if (project) add(year, { date: `${year}.${project.month}`, title: project.title });
  }
  awards.filter(item => item.date.startsWith("2018")).forEach(item => add(2018, { date: item.date, title: item.title, detail: item.org }));
  media.filter(item => item.date.startsWith("2020")).forEach(item => add(2020, { date: item.date, title: item.title, detail: item.outlet }));
  return Array.from(byYear).sort(([a], [b]) => a - b).map(([year, events]) => ({ year, events: events.sort((a, b) => a.date.localeCompare(b.date)) }));
}
const timeline = buildTimeline();

export function StoryTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(timeline[0].year);
  const { scrollY } = useScroll();
  function updateYear() {
    const elements = ref.current?.querySelectorAll<HTMLElement>("[data-story-year]");
    if (!elements) return;
    let current = timeline[0].year;
    elements.forEach(element => { if (element.getBoundingClientRect().top <= window.innerHeight * 0.48) current = Number(element.dataset.storyYear); });
    setActive(previous => previous === current ? previous : current);
  }
  useMotionValueEvent(scrollY, "change", updateYear);
  useEffect(() => { updateYear(); }, []);
  return <section className="a-story-timeline site-section" aria-labelledby="story-timeline-title"><div className="site-container">
    <Reveal className="a-story-timeline-heading"><h2 id="story-timeline-title" className="a-story-heading">{copy.story.timeline.title}</h2><p className="a-story-lead">{copy.story.timeline.lead}</p></Reveal>
    <div ref={ref} className="a-story-timeline-grid"><div className="a-story-year-column" aria-hidden="true"><div className="a-story-year-sticky"><p>심다의 시간</p><span className="a-story-active-year">{active}</span><div className="a-story-year-progress">{timeline.map(item => <span key={item.year} data-active={item.year <= active} />)}</div><span className="a-story-year-range">2016 — 2026</span></div></div>
      <div className="a-story-year-stories">{timeline.map(({ year, events }) => <section className="a-story-year-group" key={year} data-story-year={year} aria-labelledby={`story-year-${year}`}><h3 id={`story-year-${year}`}>{year}</h3><ul>{events.map((event, index) => <li key={`${event.date}-${index}`}><span className="a-story-event-date">{event.date}</span><h4>{event.title}</h4>{event.detail && <p>{event.detail}</p>}</li>)}</ul></section>)}<p className="a-story-timeline-end">{text.timelineEnd}</p></div>
    </div>
  </div></section>;
}

const patents = milestones.filter(item => item.tag === "PATENT");
const certificates = milestones.filter(item => item.tag === "CERT" && item.date !== "2021.11.11");
export function StoryRecognition() {
  return <section className="a-story-recognition site-section" aria-labelledby="story-recognition-title"><div className="site-container">
    <Reveal><h2 id="story-recognition-title" className="a-story-heading">{text.recognition}</h2><p className="a-story-lead">{copy.story.recognition.lead}</p></Reveal>
    <div className="a-story-bento">
      {patents.map((item, index) => <Reveal key={item.date} className={`a-story-recognition-tile a-story-patent a-story-patent-${index}`}><div className="a-story-tile-top"><span className="a-story-tag"><ShieldCheck size={16} aria-hidden="true" />등록특허</span><span>{item.date.slice(0, 4)}</span></div><h3>{item.detail?.split(" (등록번호")[0] ?? item.title}</h3><p>{item.detail?.match(/등록번호 ([^)]+)/)?.[1]}</p></Reveal>)}
      <Reveal className="a-story-recognition-tile a-story-certificates"><span className="a-story-tag"><Sprout size={16} aria-hidden="true" />인증</span><h3>꾸준함을 증명하는 기반.</h3><ul>{certificates.map(item => <li key={item.date}><span>{item.date.slice(0, 4)}</span>{item.title}</li>)}</ul></Reveal>
      {awards.map(item => <Reveal key={item.title} className="a-story-recognition-tile a-story-award"><div className="a-story-tile-top"><span className="a-story-tag"><Award size={16} aria-hidden="true" />수상</span><span>{item.date.slice(0, 4)}</span></div><h3>{item.title}</h3><p>{item.org}</p></Reveal>)}
    </div>
  </div></section>;
}

export function StoryMedia() {
  return <section className="a-story-media site-section" aria-labelledby="story-media-title"><div className="site-container a-story-media-grid"><Reveal><p className="a-story-kicker">식물과 삶을 잇는 이야기</p><h2 id="story-media-title" className="a-story-heading">{copy.story.media.title}</h2></Reveal><ul className="a-story-media-list">{media.map(item => <li key={`${item.date}-${item.outlet}`}><span className="a-story-media-date">{item.date}</span><div><h3>{item.outlet}</h3><p>{item.title}</p></div></li>)}</ul></div></section>;
}

export function StoryClosing() {
  const image = useSiteImage("story.philosophy");
  return <section className="a-story-closing" aria-labelledby="story-closing-title"><ParallaxImage src={image.url} alt={image.alt} strength={5} containerClassName="a-story-closing-photo" /><div className="a-story-closing-shade" /><Reveal className="a-story-closing-copy site-container"><p>{copy.story.opening.title}</p><h2 id="story-closing-title">처음의 마음으로,<br />함께 심다.</h2><Link href="/support/b2b" className="site-pill">{text.closing} <span aria-hidden="true">›</span></Link></Reveal></section>;
}
