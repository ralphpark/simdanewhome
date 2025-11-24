import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Post, Comment } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Check, X } from "lucide-react";

export default function Admin() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "인증 필요",
        description: "관리자 로그인이 필요합니다",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["/api/admin/posts"],
    enabled: isAuthenticated,
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">로드 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">관리자 대시보드</h1>
          <p className="text-muted-foreground">콘텐츠 및 댓글을 관리하세요</p>
        </div>

        <div className="flex justify-end mb-6">
          <a href="/api/logout">
            <Button variant="outline">로그아웃</Button>
          </a>
        </div>

        <Tabs defaultValue="posts" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">
              포스트 관리 ({posts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="comments">
              댓글 관리 ({comments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>발행된 포스트</CardTitle>
                <CardDescription>모든 블로그 포스트를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>조회수</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts?.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category}</Badge>
                          </TableCell>
                          <TableCell>{post.viewCount}</TableCell>
                          <TableCell>
                            {post.published ? (
                              <Badge className="bg-green-600">발행됨</Badge>
                            ) : (
                              <Badge variant="secondary">임시저장</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="icon" variant="ghost" data-testid={`edit-post-${post.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" data-testid={`delete-post-${post.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>댓글 관리</CardTitle>
                <CardDescription>사용자 댓글을 승인하거나 삭제하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments?.map((comment) => (
                    <Card key={comment.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">{comment.authorName}</p>
                          <p className="text-sm text-muted-foreground">{comment.authorEmail}</p>
                        </div>
                        <Badge variant={comment.approved ? "default" : "secondary"}>
                          {comment.approved ? "승인됨" : "대기 중"}
                        </Badge>
                      </div>
                      <p className="text-sm mb-4">{comment.content}</p>
                      <div className="flex gap-2 justify-end">
                        {!comment.approved && (
                          <Button size="sm" variant="outline" data-testid={`approve-comment-${comment.id}`} className="gap-2">
                            <Check className="h-4 w-4" />
                            승인하기
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" data-testid={`delete-comment-${comment.id}`} className="gap-2">
                          <X className="h-4 w-4" />
                          삭제하기
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {!comments || comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">댓글이 없습니다</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
