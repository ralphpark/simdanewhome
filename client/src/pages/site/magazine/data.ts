import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
export type MagazinePost = Omit<Post, "createdAt" | "publishedAt" | "updatedAt" | "published"> & { createdAt: string; publishedAt: string | null; published?: boolean };
export function postDate(post: MagazinePost) { return post.publishedAt || post.createdAt; }
export function isPublicPost(post: MagazinePost) { return post.published !== false && (!post.publishedAt || new Date(post.publishedAt).getTime() <= Date.now()); }
export function newestPosts(posts: MagazinePost[]) { return posts.filter(isPublicPost).sort((a, b) => (new Date(postDate(b)).getTime() || 0) - (new Date(postDate(a)).getTime() || 0)); }
export function usePosts() { return useQuery<MagazinePost[]>({ queryKey: ["/api/posts"] }); }
const categoryNames: Record<string, string> = { "plantcare": "식물 돌봄", "care": "식물 돌봄", "projectstory": "공간 이야기", "project": "공간 이야기", "trends": "트렌드", "interior": "플랜트 인테리어", "news": "심다 소식", "story": "이야기", "gardening": "가드닝" };
export function magazineCategory(value: string) { return categoryNames[(value || "").toLowerCase().replace(/[\s_-]/g, "")] || value || "이야기"; }
