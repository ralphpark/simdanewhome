import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PageSection, PhotoReveal, ScrollReveal, Subpage } from "@/components/site/PagePrimitives";
import { dateLabel, PageState, usePageTitle } from "./portfolio/ui";
import { isPublicPost, magazineCategory, newestPosts, postDate, usePosts, type MagazinePost } from "./magazine/data";
import { PostCard } from "./magazine/PostCard";
import { Comments } from "./magazine/Comments";
import { articleHtml } from "./magazine/articleHtml";
import "./magazine/magazine.css";

export default function MagazineDetail({ id }: { id: string }) {
  const { data: post, isPending, isError, error, refetch } = useQuery<MagazinePost>({ queryKey: [`/api/posts/${encodeURIComponent(id)}`] });
  usePageTitle(post && isPublicPost(post) ? `${post.title} — 심다 매거진` : "매거진 — 심다");
  if (isPending) return <Subpage><PageState heading={1} title="이야기를 불러옵니다" loading /></Subpage>;
  if (isError || !post || !isPublicPost(post)) return <Subpage><PageState heading={1} title={error?.message.startsWith("404") || post && !isPublicPost(post) ? "글을 찾을 수 없습니다." : "글을 불러오지 못했습니다."} retry={isError && !error?.message.startsWith("404") ? () => refetch() : undefined}><Link href="/magazine" className="sp-link">매거진으로 돌아가기 ›</Link></PageState></Subpage>;
  return <MagazineArticle key={id} post={post} />;
}

function MagazineArticle({ post }: { post: MagazinePost }) {
  const { data = [] } = usePosts();
  const html = useMemo(() => articleHtml(post.content), [post.content]);
  const related = useMemo(() => {
    const score = (item: MagazinePost) => (magazineCategory(item.category) === magazineCategory(post.category) ? 10 : 0) + (item.tags || []).filter(tag => (post.tags || []).includes(tag)).length;
    return newestPosts(data).filter(item => item.id !== post.id).sort((a, b) => score(b) - score(a)).slice(0, 3);
  }, [data, post]);
  return <Subpage className="mb-article">
    <div className="mb-progress" aria-hidden="true"><div /></div>
    <header className="mb-article-header mb-reading"><Link href="/magazine" className="b-back sp-link">‹ 모든 이야기</Link><p className="t-eye">{magazineCategory(post.category)}</p><h1 className="mb-article-title">{post.title}</h1>{post.excerpt && <p className="t-intro">{post.excerpt}</p>}<div className="mb-article-meta"><span>{post.author}</span><time dateTime={postDate(post)}>{dateLabel(postDate(post))}</time>{typeof post.viewCount === "number" && <span>조회 {post.viewCount.toLocaleString("ko-KR")}</span>}</div></header>
    <div className="sp-wrap mb-article-cover"><PhotoReveal src={post.thumbnailUrl} alt={post.title} eager aspectRatio="16/10" /></div>
    <div className="mb-reading mb-article-body" dangerouslySetInnerHTML={{ __html: html }} />
    {post.tags?.length > 0 && <ul className="mb-reading mb-tags" aria-label="태그">{Array.from(new Set(post.tags)).map(tag => <li key={tag}>{tag}</li>)}</ul>}
    <Comments key={post.id} postId={post.id} />
    {related.length > 0 && <PageSection title="함께 읽는 이야기." alt><div className="mb-grid">{related.map(item => <ScrollReveal key={item.id}><PostCard post={item} /></ScrollReveal>)}</div><div className="sp-actions"><Link href="/magazine" className="sp-link">모든 이야기 ›</Link></div></PageSection>}
  </Subpage>;
}
