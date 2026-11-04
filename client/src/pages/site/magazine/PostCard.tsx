import { Link } from "wouter";
import { ContentImage, dateLabel } from "../portfolio/ui";
import { magazineCategory, postDate, type MagazinePost } from "./data";
export function PostCard({ post }: { post: MagazinePost }) {
  return <Link href={`/magazine/${encodeURIComponent(post.id)}`} className="mb-card"><div className="mb-card-image"><ContentImage src={post.thumbnailUrl} alt={post.title} /></div><div className="mb-card-copy"><p className="mb-card-category">{magazineCategory(post.category)}</p><h3>{post.title}</h3>{post.excerpt && <p className="mb-card-excerpt">{post.excerpt}</p>}<time dateTime={postDate(post)}>{dateLabel(postDate(post))}</time><span className="mb-card-arrow" aria-hidden="true">↗</span></div></Link>;
}
