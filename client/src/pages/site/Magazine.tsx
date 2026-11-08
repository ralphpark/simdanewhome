import { SiteText } from "@/components/site/SiteText";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PageHead, PageSection, SegmentedControl, Subpage } from "@/components/site/PagePrimitives";
import { copy } from "@/content/copy";
import { useSiteImage } from "@/hooks/useSiteImage";
import { ContentImage, dateLabel, PageState, usePageTitle } from "./portfolio/ui";
import { magazineCategory, newestPosts, postDate, usePosts } from "./magazine/data";
import { PostCard } from "./magazine/PostCard";
import "./magazine/magazine.css";

export default function Magazine() {
  usePageTitle(copy.seo["/magazine"].title);
  const { data = [], isPending, isError, refetch } = usePosts();
  const fallback = useSiteImage("magazine.hero");
  const [category, setCategory] = useState("all");
  const reduce = useReducedMotion();
  const posts = useMemo(() => newestPosts(data), [data]);
  const latest = posts[0];
  const categories = [{ key: "all", label: "전체" }, ...Array.from(new Set(posts.map(post => magazineCategory(post.category)))).map(label => ({ key: label, label }))];
  const visible = posts.filter(post => category === "all" || magazineCategory(post.category) === category);
  return <Subpage className="magazine-page">
    <PageHead eyebrow={<SiteText k="magazine.hero.eyebrow" />} title={<SiteText k="magazine.hero.title" />} intro={<SiteText k="magazine.hero.lead" />} />
    <section className="mb-feature-section sp-wrap" aria-label="대표 이야기">
      {isPending ? <PageState title="새로운 이야기를 불러옵니다" loading /> : isError ? <PageState title="이야기를 불러오지 못했습니다." detail="잠시 후 다시 불러와 주세요." retry={() => refetch()} /> : latest ? <Link href={`/magazine/${encodeURIComponent(latest.id)}`} className="mb-feature">
        <div className="mb-feature-image"><ContentImage src={latest.thumbnailUrl} alt={latest.title} eager /></div>
        <div className="mb-feature-copy"><p className="t-eye">{magazineCategory(latest.category)}</p><h2 className="t-h2">{latest.title}</h2>{latest.excerpt && <p className="t-intro">{latest.excerpt}</p>}<div className="mb-feature-meta"><time dateTime={postDate(latest)}>{dateLabel(postDate(latest))}</time><span className="sp-link">{<SiteText k="magazine.feature.link" />} <span aria-hidden="true">›</span></span></div></div>
      </Link> : <div className="mb-feature">
        <div className="mb-feature-image"><ContentImage src={fallback.url} alt={fallback.alt} eager /></div><div className="mb-feature-copy"><h2 className="t-h2">다음 이야기를 심고 있습니다.</h2><p className="t-intro">식물과 함께하는 일상의 기록을 곧 이곳에서 만나보세요.</p><Link href="/portfolio" className="sp-link">심다의 작업 둘러보기 ›</Link></div>
      </div>}
    </section>
    {!isPending && !isError && <PageSection id="magazine-stories" title={<SiteText k="magazine.stories.title" />} alt>
      {posts.length > 0 ? <><SegmentedControl options={categories} value={category} onChange={setCategory} label="매거진 카테고리" /><p className="b-result-count" role="status" aria-live="polite">{visible.length}편의 이야기</p><motion.div layout={!reduce} className="mb-grid"><AnimatePresence initial={false} mode="popLayout">{visible.map(post => <motion.div layout={!reduce} key={post.id} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.35, ease: [0.2, 0.8, 0.2, 1] }}><PostCard post={post} /></motion.div>)}</AnimatePresence></motion.div>{visible.length === 0 && <PageState title="이 분류의 글을 준비하고 있습니다."><button className="sp-link" onClick={() => setCategory("all")}>전체 이야기 보기 ›</button></PageState>}</> : <PageState title={copy.magazine.empty} detail="식물과 함께하는 일상의 기록을 곧 이곳에서 만나보세요."><Link href="/story" className="sp-link">심다의 이야기 먼저 만나기 ›</Link></PageState>}
    </PageSection>}
  </Subpage>;
}
