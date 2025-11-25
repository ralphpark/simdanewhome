import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Portfolio, InsertPortfolio } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminPortfolios() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<InsertPortfolio>>({
    title: "",
    description: "",
    category: "indoor",
    clientName: "",
    thumbnailUrl: "",
    images: [],
    featured: false,
  });

  const { data: portfolios = [] } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "인증 필요",
        description: "관리자 로그인이 필요합니다",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/");
      }, 500);
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  const createPortfolioMutation = useMutation({
    mutationFn: async (data: Partial<InsertPortfolio>) => {
      const res = await apiRequest("POST", "/api/portfolios", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      toast({
        title: "성공",
        description: "포트폴리오가 생성되었습니다",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "오류",
        description: "포트폴리오 생성에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: Partial<InsertPortfolio>) => {
      const res = await apiRequest("PATCH", `/api/portfolios/${editingId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      toast({
        title: "성공",
        description: "포트폴리오가 수정되었습니다",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "오류",
        description: "포트폴리오 수정에 실패했습니다",
        variant: "destructive",
      });
    },
  });

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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "indoor",
      clientName: "",
      thumbnailUrl: "",
      images: [],
      featured: false,
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (portfolio: Portfolio) => {
    setFormData(portfolio);
    setEditingId(portfolio.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.thumbnailUrl) {
      toast({
        title: "필수 항목",
        description: "제목, 설명, 썸네일은 필수입니다",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updatePortfolioMutation.mutate(formData);
    } else {
      createPortfolioMutation.mutate(formData);
    }
  };

  if (authLoading) {
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
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">포트폴리오 관리</h1>
            <p className="text-muted-foreground mt-1">프로젝트 포트폴리오를 관리하세요</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            새 포트폴리오
          </Button>
        </div>

        {/* Form */}
        {isFormOpen && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingId ? "포트폴리오 수정" : "새 포트폴리오 추가"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">제목 *</label>
                    <Input
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="프로젝트 제목"
                    />
                  </div>

                  {/* Client */}
                  <div>
                    <label className="block text-sm font-medium mb-2">클라이언트</label>
                    <Input
                      value={formData.clientName || ""}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="클라이언트명"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">카테고리</label>
                    <select
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="indoor">실내 공간</option>
                      <option value="outdoor">실외 공간</option>
                      <option value="office">오피스</option>
                      <option value="commercial">상업공간</option>
                      <option value="residential">주거공간</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">완료 날짜</label>
                    <Input
                      type="date"
                      value={
                        formData.completedDate
                          ? new Date(formData.completedDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          completedDate: e.target.value ? new Date(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium mb-2">썸네일 이미지 URL *</label>
                  <Input
                    value={formData.thumbnailUrl || ""}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">설명 *</label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="프로젝트 설명"
                    className="resize-none h-32"
                  />
                </div>

                {/* Featured */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                    이 포트폴리오를 특별히 표시 (홈페이지에 우선 표시)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createPortfolioMutation.isPending || updatePortfolioMutation.isPending
                    }
                  >
                    {editingId ? "수정 완료" : "포트폴리오 추가"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Portfolio List */}
        <Card>
          <CardHeader>
            <CardTitle>포트폴리오 목록 ({portfolios.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>클라이언트</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolios.map((portfolio) => (
                    <TableRow key={portfolio.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {portfolio.title}
                      </TableCell>
                      <TableCell>{portfolio.clientName || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{portfolio.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {portfolio.featured ? (
                          <Badge className="bg-blue-600">특별 표시</Badge>
                        ) : (
                          <Badge variant="secondary">일반</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(portfolio)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost">
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
                                onClick={() =>
                                  deletePortfolioMutation.mutate(portfolio.id)
                                }
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
      </div>
    </div>
  );
}
