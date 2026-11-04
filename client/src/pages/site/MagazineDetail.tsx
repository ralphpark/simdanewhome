import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal, Stagger } from "@/components/site/motion";
import { ContentImage, dateLabel, MaskTitle, PageState, usePageTitle } from "./portfolio/ui";
import { isPublicPost, magazineCategory, newestPosts, postDate, usePosts, type MagazinePost } from "./magazine/data";
import { PostCard } from "./magazine/PostCard";
import { Comments } from "./magazine/Comments";
import { articleHtml } from "./magazine/articleHtml";
import "./magazine/magazine.css";

export default function MagazineDetail({ id }: { id: string }) {
  const { data: post, isPending, isError, error, refetch } = useQuery<MagazinePost>({ queryKey: [`/api/posts/${encodeURIComponent(id)}`] });
  usePageTitle(post && isPublicPost(post) ? `${post.title} — 심다 매거진` : "매거진 — 심다");
  if (isPending) return <div className="team-b"><PageState heading={1} title="이야기를 불러옵니다" loading /></div>;
  if (isError || !post || !isPublicPost(post)) return <div className="team-b"><PageState heading={1} title={error?.message.startsWith("404") || post && !isPublicPost(post) ? "글을 찾을 수 없습니다." : "글을 불러오지 못했습니다."} retry={isError && !error?.message.startsWith("404") ? () => refetch() : undefined}><Link href="/magazine" className="site-link">매거진으로 돌아가기 ›</Link></PageState></div>;
  return <MagazineArticle key={id} post={post} />;
}

function MagazineArticle({ post }: { post: MagazinePost }) {
  const { data = [] } = usePosts();
  const reduce = useReducedMotion();
  const body = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const html = useMemo(() => articleHtml(post.content), [post.content]);
  const { scrollYProgress: reading } = useScroll({ target: body, offset: ["start 0.2", "end 0.8"] });
  const { scrollYProgress: coverProgress } = useScroll({ target: cover, offset: ["start 0.2", "end start"] });
  const scale = useTransform(coverProgress, [0, 1], [1, 0.9]);
  const related = useMemo(() => {
    const score = (item: MagazinePost) => (magazineCategory(item.category) === magazineCategory(post.category) ? 10 : 0) + (item.tags || []).filter(tag => (post.tags || []).includes(tag)).length;
    return newestPosts(data).filter(item => item.id !== post.id).sort((a, b) => score(b) - score(a)).slice(0, 3);
  }, [data, post]);
  useEffect(() => {
    if (!body.current || reduce) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animations.push(entry.target.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 800, easing: "cubic-bezier(.25,.1,.25,1)", fill: "both" }));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    body.current.querySelectorAll("img").forEach(image => observer.observe(image));
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); };
  }, [html, reduce]);
  return <article className="team-b mb-article">
    <div className="mb-progress" aria-hidden="true"><motion.div style={{ scaleX: reading }} /></div>
    <header className="mb-article-header mb-reading"><Link href="/magazine" className="b-back site-link">‹ 모든 이야기</Link><p className="mb-feature-category">{magazineCategory(post.category)}</p><MaskTitle text={post.title} className="mb-article-title" />{post.excerpt && <p className="mb-article-excerpt">{post.excerpt}</p>}<div className="mb-article-meta"><span>{post.author}</span><time dateTime={postDate(post)}>{dateLabel(postDate(post))}</time>{typeof post.viewCount === "number" && <span>조회 {post.viewCount.toLocaleString("ko-KR")}</span>}</div></header>
    <div ref={cover} className="mb-article-cover-wrap"><motion.figure className="mb-article-cover" style={reduce ? undefined : { scale }}><ContentImage src={post.thumbnailUrl} alt={post.title} eager /></motion.figure></div>
    <div className="mb-reading mb-article-body" ref={body} dangerouslySetInnerHTML={{ __html: html }} />
    {post.tags?.length > 0 && <ul className="mb-reading mb-tags" aria-label="태그">{Array.from(new Set(post.tags)).map(tag => <li key={tag}>{tag}</li>)}</ul>}
    <Comments key={post.id} postId={post.id} />
    {related.length > 0 && <section className="mb-related site-section" aria-labelledby="related-title"><div className="site-container"><Reveal className="b-section-heading"><h2 id="related-title" className="site-headline">함께 읽는 이야기</h2><Link href="/magazine" className="site-link">모든 이야기 ›</Link></Reveal><Stagger className="mb-grid">{related.map(item => <Reveal key={item.id}><PostCard post={item} /></Reveal>)}</Stagger></div></section>}
  </article>;
}
