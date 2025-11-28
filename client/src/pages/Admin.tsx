import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post, Comment, Booking, B2bProposal, Portfolio, Timeline, Document } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Check, X, Plus, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "wouter";

export default function Admin() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<B2bProposal | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    // Get active tab from sessionStorage
    return sessionStorage.getItem('adminActiveTab') || 'posts';
  });

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

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments"],
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: b2bProposals = [] } = useQuery<B2bProposal[]>({
    queryKey: ["/api/b2b-proposals"],
  });

  const { data: portfolios = [] } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
  });

  const { data: timelines = [] } = useQuery<Timeline[]>({
    queryKey: ["/api/timelines"],
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // State for document form
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<"company-intro" | "proposal-template">("company-intro");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: async (portfolioId: string) => {
      const res = await apiRequest("DELETE", `/api/portfolios/${portfolioId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      toast({
        title: "성공",
        description: "포트폴리오가 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "포트폴리오 삭제에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Delete timeline mutation
  const deleteTimelineMutation = useMutation({
    mutationFn: async (timelineId: string) => {
      const res = await apiRequest("DELETE", `/api/timelines/${timelineId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelines"] });
      toast({
        title: "성공",
        description: "연혁 항목이 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "연혁 항목 삭제에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await apiRequest("DELETE", `/api/posts/${postId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "성공",
        description: "포스트가 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "포스트 삭제에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "업로드 실패");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setDocumentName("");
      setDocumentFile(null);
      setDocumentType("company-intro");
      toast({
        title: "성공",
        description: "문서가 업로드되었습니다",
      });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "문서 업로드에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await apiRequest("DELETE", `/api/documents/${docId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "성공",
        description: "문서가 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "문서 삭제에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({
        title: "성공",
        description: "댓글이 삭제되었습니다",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "댓글 삭제에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await apiRequest("PATCH", `/api/comments/${commentId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({
        title: "성공",
        description: "댓글이 승인되었습니다",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "댓글 승인에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "성공",
        description: "예약 상태가 업데이트되었습니다",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상태 업데이트에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Update B2B proposal status mutation
  const updateB2bStatusMutation = useMutation({
    mutationFn: async ({ proposalId, status }: { proposalId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/b2b-proposals/${proposalId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/b2b-proposals"] });
      toast({
        title: "성공",
        description: "제안 상태가 업데이트되었습니다",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상태 업데이트에 실패했습니다",
        variant: "destructive",
      });
    },
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

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const pendingB2b = b2bProposals.filter(p => p.status === 'pending').length;
  const pendingComments = comments.filter(c => !c.approved).length;

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">관리자 대시보드</h1>
          <p className="text-muted-foreground">콘텐츠, 예약, 제안을 관리하세요</p>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">대기 중인 예약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">처리 대기 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">대기 중인 B2B 제안</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingB2b}</div>
              <p className="text-xs text-muted-foreground mt-1">처리 대기 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">승인 대기 댓글</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingComments}</div>
              <p className="text-xs text-muted-foreground mt-1">승인 필요</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 포스트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">발행됨 포함</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mb-6 gap-2">
          <Link href="/">
            <Button variant="outline">사이트 보기</Button>
          </Link>
          <a href="/api/logout">
            <Button variant="outline">로그아웃</Button>
          </a>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          sessionStorage.setItem('adminActiveTab', val);
        }} className="space-y-8">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="posts">포스트 ({posts.length})</TabsTrigger>
            <TabsTrigger value="portfolios">포트폴리오 ({portfolios.length})</TabsTrigger>
            <TabsTrigger value="bookings">예약 ({bookings.length})</TabsTrigger>
            <TabsTrigger value="b2b">B2B 제안 ({b2bProposals.length})</TabsTrigger>
            <TabsTrigger value="comments">댓글 ({comments.length})</TabsTrigger>
            <TabsTrigger value="timelines">연혁 ({timelines.length})</TabsTrigger>
            <TabsTrigger value="documents">문서 ({documents.length})</TabsTrigger>
          </TabsList>

          {/* 포스트 탭 */}
          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>포스트 관리</CardTitle>
                  <CardDescription>블로그 포스트를 관리하세요</CardDescription>
                </div>
                <Link href="/admin/posts/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    새 포스트
                  </Button>
                </Link>
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
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category}</Badge>
                          </TableCell>
                          <TableCell>{post.viewCount || 0}</TableCell>
                          <TableCell>
                            {post.published ? (
                              <Badge className="bg-green-600">발행됨</Badge>
                            ) : (
                              <Badge variant="secondary">임시저장</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Link href={`/admin/posts/${post.id}`}>
                              <Button size="icon" variant="ghost" data-testid={`edit-post-${post.id}`}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" data-testid={`delete-post-${post.id}`}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>포스트 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                                <div className="flex gap-2 justify-end">
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deletePostMutation.mutate(post.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    삭제
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {posts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      포스트가 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 포트폴리오 탭 */}
          <TabsContent value="portfolios" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>포트폴리오 관리</CardTitle>
                  <CardDescription>프로젝트 포트폴리오를 관리하세요</CardDescription>
                </div>
                <Link href="/admin/portfolios/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    새 포트폴리오
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>클라이언트</TableHead>
                        <TableHead>특별표시</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolios.map((portfolio) => (
                        <TableRow key={portfolio.id}>
                          <TableCell className="font-medium max-w-xs truncate">{portfolio.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{portfolio.category}</Badge>
                          </TableCell>
                          <TableCell>{portfolio.clientName || "-"}</TableCell>
                          <TableCell>
                            {portfolio.featured ? (
                              <Badge className="bg-yellow-600">⭐ 특별</Badge>
                            ) : (
                              <Badge variant="secondary">일반</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Link href={`/admin/portfolios/${portfolio.id}`}>
                              <Button size="icon" variant="ghost" data-testid={`edit-portfolio-${portfolio.id}`}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" data-testid={`delete-portfolio-${portfolio.id}`}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>포트폴리오 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 포트폴리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                                <div className="flex gap-2 justify-end">
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deletePortfolioMutation.mutate(portfolio.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    삭제
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {portfolios.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      포트폴리오가 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 예약 탭 */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>예약/상담 관리</CardTitle>
                <CardDescription>고객 예약을 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>상담 유형</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.name}</TableCell>
                          <TableCell>{booking.phone}</TableCell>
                          <TableCell className="text-sm">{booking.email}</TableCell>
                          <TableCell className="text-sm">{booking.consultationType || '상담'}</TableCell>
                          <TableCell>
                            <select
                              value={booking.status}
                              onChange={(e) =>
                                updateBookingStatusMutation.mutate({
                                  bookingId: booking.id,
                                  status: e.target.value,
                                })
                              }
                              className="px-2 py-1 rounded border text-sm"
                            >
                              <option value="pending">대기 중</option>
                              <option value="confirmed">확인 완료</option>
                              <option value="completed">완료</option>
                              <option value="cancelled">취소</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs"
                              onClick={() => setSelectedBooking(booking)}
                              data-testid={`button-view-booking-${booking.id}`}
                            >
                              보기
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {bookings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      예약이 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* B2B 제안 탭 */}
          <TabsContent value="b2b" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>B2B 제안 관리</CardTitle>
                <CardDescription>기업 협업 제안을 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>회사명</TableHead>
                        <TableHead>담당자</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {b2bProposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell className="font-medium">{proposal.companyName}</TableCell>
                          <TableCell>{proposal.contactName}</TableCell>
                          <TableCell>{proposal.phone}</TableCell>
                          <TableCell className="text-sm">{proposal.email}</TableCell>
                          <TableCell>
                            <select
                              value={proposal.status}
                              onChange={(e) =>
                                updateB2bStatusMutation.mutate({
                                  proposalId: proposal.id,
                                  status: e.target.value,
                                })
                              }
                              className="px-2 py-1 rounded border text-sm"
                            >
                              <option value="pending">대기 중</option>
                              <option value="reviewing">검토 중</option>
                              <option value="contacted">연락 완료</option>
                              <option value="in_progress">진행 중</option>
                              <option value="completed">완료</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs"
                              onClick={() => setSelectedProposal(proposal)}
                              data-testid={`button-view-proposal-${proposal.id}`}
                            >
                              보기
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {b2bProposals.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      B2B 제안이 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 댓글 탭 */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>댓글 관리</CardTitle>
                <CardDescription>사용자 댓글을 승인하거나 삭제하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.map((comment) => (
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
                          <Button
                            size="sm"
                            variant="outline"
                            data-testid={`approve-comment-${comment.id}`}
                            className="gap-2"
                            onClick={() => approveCommentMutation.mutate(comment.id)}
                          >
                            <Check className="h-4 w-4" />
                            승인하기
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" data-testid={`delete-comment-${comment.id}`} className="gap-2">
                              <X className="h-4 w-4" />
                              삭제하기
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 댓글을 삭제하시겠습니까?
                            </AlertDialogDescription>
                            <div className="flex gap-2 justify-end">
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                삭제
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </Card>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      댓글이 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 연혁 탭 */}
          <TabsContent value="timelines" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>회사 연혁 관리</CardTitle>
                  <CardDescription>회사 타임라인을 관리하세요</CardDescription>
                </div>
                <Link href="/admin/timelines/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    새 항목 추가
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelines.map((timeline) => (
                    <Card key={timeline.id} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-primary">{timeline.year}</span>
                              <h4 className="font-semibold">{timeline.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{timeline.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/admin/timelines/${timeline.id}`}>
                              <Button size="sm" variant="ghost">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 연혁 항목을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
                                </AlertDialogDescription>
                                <div className="flex justify-end gap-2">
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      deleteTimelineMutation.mutate(timeline.id);
                                    }}
                                  >
                                    삭제
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {timelines.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      연혁 항목이 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 문서 탭 */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>회사 문서 관리</CardTitle>
                  <CardDescription>회사소개서 및 제안서 양식을 관리하세요</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 문서 업로드 폼 */}
                <Card className="bg-muted/50 p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">새 문서 업로드</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">문서명</label>
                        <Input
                          placeholder="예: 2024 회사소개서"
                          value={documentName}
                          onChange={(e) => setDocumentName(e.target.value)}
                          data-testid="input-document-name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">문서 유형</label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="company-intro"
                              checked={documentType === "company-intro"}
                              onChange={(e) => setDocumentType(e.target.value as "company-intro" | "proposal-template")}
                              data-testid="radio-company-intro"
                            />
                            <span className="text-sm">회사소개서</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="proposal-template"
                              checked={documentType === "proposal-template"}
                              onChange={(e) => setDocumentType(e.target.value as "company-intro" | "proposal-template")}
                              data-testid="radio-proposal-template"
                            />
                            <span className="text-sm">제안서 양식</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">파일 선택</label>
                        <Input
                          type="file"
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                          data-testid="input-document-file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        />
                        {documentFile && (
                          <p className="text-xs text-muted-foreground mt-2">
                            선택된 파일: {documentFile.name}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          if (documentName && documentFile && documentType) {
                            const formData = new FormData();
                            formData.append("name", documentName);
                            formData.append("type", documentType);
                            formData.append("file", documentFile);
                            createDocumentMutation.mutate(formData);
                          } else {
                            toast({
                              title: "오류",
                              description: "모든 항목을 입력해주세요",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={createDocumentMutation.isPending}
                        data-testid="button-upload-document"
                      >
                        {createDocumentMutation.isPending ? "업로드 중..." : "업로드"}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* 문서 목록 */}
                <div className="space-y-3">
                  <h3 className="font-semibold">업로드된 문서</h3>
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      업로드된 문서가 없습니다
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <Card key={doc.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.type === "company-intro" ? "회사소개서" : "제안서 양식"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(doc.createdAt).toLocaleDateString("ko-KR")}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="ghost" data-testid={`button-download-${doc.id}`}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-destructive" data-testid={`button-delete-doc-${doc.id}`}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogTitle>문서 삭제</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    이 문서를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
                                  </AlertDialogDescription>
                                  <div className="flex justify-end gap-2">
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 예약 상세 Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>예약 상세 정보</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">이름</p>
                  <p className="font-medium">{selectedBooking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">연락처</p>
                  <p className="font-medium">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">이메일</p>
                  <p className="font-medium">{selectedBooking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상담 유형</p>
                  <p className="font-medium">{selectedBooking.consultationType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">희망 날짜</p>
                  <p className="font-medium">
                    {selectedBooking.preferredDate
                      ? new Date(selectedBooking.preferredDate).toLocaleDateString("ko-KR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">희망 시간</p>
                  <p className="font-medium">{selectedBooking.preferredTime || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  <p className="font-medium">
                    {selectedBooking.status === "pending" && "대기 중"}
                    {selectedBooking.status === "confirmed" && "확인 완료"}
                    {selectedBooking.status === "completed" && "완료"}
                    {selectedBooking.status === "cancelled" && "취소"}
                  </p>
                </div>
                {(selectedBooking.consultationType === "subscription" || selectedBooking.consultationType === "AI curation") && selectedBooking.message && (
                  <div className="border-t pt-4 space-y-4">
                    {selectedBooking.message.includes("===CONSULTATION_END===") ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {selectedBooking.consultationType === "subscription" ? "AI 상담 기록" : "AI 큐레이션 기록"}
                          </p>
                          <div className="bg-muted p-3 rounded text-xs whitespace-pre-wrap max-h-80 overflow-y-auto">
                            {selectedBooking.message.split("===CONSULTATION_END===")[0].trim()}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">추가 요청사항</p>
                          <p className="text-sm whitespace-pre-wrap">
                            {selectedBooking.message.split("===CONSULTATION_END===")[1]?.trim() || "-"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedBooking.consultationType === "subscription" ? "AI 상담 기록" : "AI 큐레이션 기록"}
                        </p>
                        <div className="bg-muted p-3 rounded text-xs whitespace-pre-wrap max-h-80 overflow-y-auto">
                          {selectedBooking.message}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedBooking.consultationType !== "subscription" && selectedBooking.consultationType !== "AI curation" && (
                  <div>
                    <p className="text-sm text-muted-foreground">문의 내용</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedBooking.message || "-"}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* B2B 제안 상세 Dialog */}
        <Dialog open={!!selectedProposal} onOpenChange={(open) => !open && setSelectedProposal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>B2B 제안 상세 정보</DialogTitle>
            </DialogHeader>
            {selectedProposal && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">회사명</p>
                  <p className="font-medium">{selectedProposal.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">담당자</p>
                  <p className="font-medium">{selectedProposal.contactName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">연락처</p>
                  <p className="font-medium">{selectedProposal.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">이메일</p>
                  <p className="font-medium">{selectedProposal.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  <p className="font-medium">
                    {selectedProposal.status === "pending" && "대기 중"}
                    {selectedProposal.status === "reviewing" && "검토 중"}
                    {selectedProposal.status === "contacted" && "연락 완료"}
                    {selectedProposal.status === "in_progress" && "진행 중"}
                    {selectedProposal.status === "completed" && "완료"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">제안 내용</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.proposalContent}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
