import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal, Stagger } from "@/components/site/motion";
import { copy } from "@/content/copy";
import { useSiteImage } from "@/hooks/useSiteImage";
import { ContentImage, dateLabel, MaskTitle, PageState, Segments, usePageTitle } from "./portfolio/ui";
import { magazineCategory, newestPosts, postDate, usePosts } from "./magazine/data";
import { PostCard } from "./magazine/PostCard";
import "./magazine/magazine.css";

const text = { latest: "새로운 이야기", emptyTitle: "다음 이야기를 심고 있습니다.", emptyLead: "식물과 함께하는 일상의 기록을 곧 이곳에서 만나보세요.", explore: "심다의 작업 둘러보기" };
export default function Magazine() {
  usePageTitle(copy.seo["/magazine"].title);
  const { data = [], isPending, isError, refetch } = usePosts();
  const fallback = useSiteImage("magazine.hero");
  const [category, setCategory] = useState("all");
  const posts = useMemo(() => newestPosts(data), [data]);
  const latest = posts[0];
  const categories = [{ key: "all", label: "전체" }, ...Array.from(new Set(posts.map(post => magazineCategory(post.category)))).map(label => ({ key: label, label }))];
  const visible = posts.filter(post => category === "all" || magazineCategory(post.category) === category);
  const hero = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  return <article className="team-b magazine-page">
    <section className="mb-feature site-container" ref={hero} aria-label={copy.magazine.hero.title}>
      {isPending ? <><h1 className="site-headline">{copy.magazine.hero.title}</h1><PageState title="새로운 이야기를 불러옵니다" loading /></> : isError ? <><h1 className="site-headline">{copy.magazine.hero.title}</h1><PageState title="이야기를 불러오지 못했습니다." detail="잠시 후 다시 불러와 주세요." retry={() => refetch()} /></> : latest ? <>
        <div className="mb-feature-copy"><p className="b-kicker">{copy.magazine.hero.title}</p><p className="mb-feature-category">{magazineCategory(latest.category)}</p><MaskTitle text={latest.title} className="mb-feature-title" /><p className="mb-feature-excerpt">{latest.excerpt}</p><div className="mb-feature-meta"><time dateTime={postDate(latest)}>{dateLabel(postDate(latest))}</time><Link href={`/magazine/${encodeURIComponent(latest.id)}`} className="site-link">{copy.magazine.readMore} <span aria-hidden="true">›</span></Link></div></div>
        <Link href={`/magazine/${encodeURIComponent(latest.id)}`} className="mb-feature-image" aria-label={`${latest.title} 기사 읽기`}><motion.div style={reduce ? undefined : { scale }}><ContentImage src={latest.thumbnailUrl} alt={latest.title} eager /></motion.div><span className="mb-feature-open" aria-hidden="true">↗</span></Link>
      </> : <>
        <div className="mb-feature-copy"><p className="b-kicker">{copy.magazine.hero.title}</p><MaskTitle text={text.emptyTitle} className="mb-feature-title" /><p className="mb-feature-excerpt">{copy.magazine.hero.lead}</p><Link href="/portfolio" className="site-link">{text.explore} ›</Link></div><div className="mb-feature-image"><ContentImage src={fallback.url} alt={fallback.alt} eager /></div>
      </>}
    </section>
    {!isPending && !isError && <section className="mb-stories site-section" aria-labelledby="stories-title"><div className="site-container">
      <Reveal className="b-section-heading"><h2 id="stories-title" className="site-headline">{text.latest}</h2><p>{copy.magazine.hero.lead}</p></Reveal>
      {posts.length > 0 ? <><Segments options={categories} value={category} onChange={setCategory} label="매거진 카테고리" /><p className="b-result-count" role="status">{visible.length}편의 이야기</p><Stagger key={category} className="mb-grid">{visible.map(post => <Reveal key={post.id}><PostCard post={post} /></Reveal>)}</Stagger>{visible.length === 0 && <PageState title="이 분류의 글을 준비하고 있습니다."><button className="site-link" onClick={() => setCategory("all")}>전체 이야기 보기 ›</button></PageState>}</> : <PageState title={copy.magazine.empty} detail={text.emptyLead}><Link href="/story" className="site-link">심다의 이야기 먼저 만나기 ›</Link></PageState>}
    </div></section>}
  </article>;
}
