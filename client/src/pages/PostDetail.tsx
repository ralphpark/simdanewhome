import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import type { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Eye, Send } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostDetail() {
  const [match, params] = useRoute("/magazine/:id");
  const id = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");

  // Fetch post
  const { data: post, isLoading: postLoading } = useQuery<Post>({
    queryKey: [`/api/posts/${id}`],
  });

  // Fetch all posts for navigation
  const { data: allPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: [`/api/posts/${id}/comments`],
  });

  // Submit comment mutation
  const submitCommentMutation = useMutation({
    mutationFn: async (data: { authorName: string; authorEmail: string; content: string }) => {
      const res = await apiRequest("POST", `/api/posts/${id}/comments`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}/comments`] });
      setCommentName("");
      setCommentEmail("");
      setCommentContent("");
      toast({
        title: "성공",
        description: "댓글이 제출되었습니다. 승인 후 표시됩니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "댓글 제출에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentEmail || !commentContent) {
      toast({
        title: "필수 항목",
        description: "모든 필드를 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    submitCommentMutation.mutate({
      authorName: commentName,
      authorEmail: commentEmail,
      content: commentContent,
    });
  };

  if (postLoading) {
    return (
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="aspect-video w-full mb-8" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">포스트를 찾을 수 없습니다</h1>
          <Link href="/magazine">
            <Button>매거진으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get previous and next posts
  const publishedPosts = allPosts?.filter(p => p.published) || [];
  const currentIndex = publishedPosts.findIndex(p => p.id === id);
  const prevPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < publishedPosts.length - 1 ? publishedPosts[currentIndex + 1] : null;

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <Link href="/magazine">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            매거진으로 돌아가기
          </Button>
        </Link>

        {/* Post content */}
        <article>
          {/* Thumbnail */}
          {post.thumbnailUrl && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-8">
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground flex-wrap">
            <Badge variant="outline">{post.category}</Badge>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.createdAt), "yyyy.MM.dd", { locale: ko })}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {/* Author */}
          <p className="text-muted-foreground mb-12">작성자: {post.author}</p>

          {/* Content */}
          <div
            className="prose prose-sm md:prose-base max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Navigation */}
        {(prevPost || nextPost) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 py-8 border-t border-b">
            {prevPost ? (
              <Link href={`/magazine/${prevPost.id}`}>
                <Card className="cursor-pointer hover-elevate h-full">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">이전 포스트</p>
                    <p className="font-semibold line-clamp-2">{prevPost.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div />
            )}
            {nextPost ? (
              <Link href={`/magazine/${nextPost.id}`}>
                <Card className="cursor-pointer hover-elevate h-full">
                  <CardContent className="p-4 text-right">
                    <p className="text-xs text-muted-foreground mb-2">다음 포스트</p>
                    <p className="font-semibold line-clamp-2">{nextPost.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* Comments section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">댓글</h2>

          {/* Comment form */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">댓글 남기기</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="이름"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="이메일"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder="댓글을 입력하세요..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-24"
                />
                <Button
                  type="submit"
                  disabled={submitCommentMutation.isPending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  댓글 제출
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments list */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{comment.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "yyyy.MM.dd HH:mm", { locale: ko })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">아직 댓글이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
