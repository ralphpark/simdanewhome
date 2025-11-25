import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
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
  const [matchNew] = useRoute("/admin/portfolios/new");
  const [matchEdit, params] = useRoute("/admin/portfolios/:id");
  // Only use routeId if it's not "new" (to avoid matching /admin/portfolios/new as an ID)
  const routeId = params?.id && params.id !== "new" ? params.id : null;
  const [isFormOpen, setIsFormOpen] = useState(!!matchNew || !!matchEdit);
  const [editingId, setEditingId] = useState<string | null>(routeId || null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<InsertPortfolio>>({
    title: "",
    description: "",
    category: "indoor",
    clientName: "",
    thumbnailUrl: "",
    completedDate: undefined,
    images: [],
    featured: false,
  });

  const { data: portfolios = [] } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  const { data: editingPortfolio } = useQuery<Portfolio>({
    queryKey: [`/api/portfolios/${routeId}`],
    enabled: isAuthenticated && !!routeId && !!matchEdit,
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

  // 기존 포트폴리오 로드 시 폼 데이터 업데이트
  useEffect(() => {
    if (editingPortfolio && editingId === routeId) {
      setFormData({
        title: editingPortfolio.title,
        description: editingPortfolio.description,
        category: editingPortfolio.category,
        clientName: editingPortfolio.clientName,
        completedDate: editingPortfolio.completedDate ? new Date(editingPortfolio.completedDate) : undefined,
        thumbnailUrl: editingPortfolio.thumbnailUrl,
        images: editingPortfolio.images,
        featured: editingPortfolio.featured,
      });
    }
  }, [editingPortfolio, editingId, routeId]);

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
      navigate("/admin?tab=portfolios");
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
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${editingId}`] });
      toast({
        title: "성공",
        description: "포트폴리오가 수정되었습니다",
      });
      navigate("/admin?tab=portfolios");
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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData({ ...formData, thumbnailUrl: base64 });
        toast({
          title: "성공",
          description: "썸네일이 선택되었습니다",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "오류",
        description: "파일 업로드에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const newImages: string[] = formData.images || [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          newImages.push(base64);
          setFormData({ ...formData, images: newImages });
        };
        reader.readAsDataURL(file);
      }
      toast({
        title: "성공",
        description: `${files.length}개의 이미지가 추가되었습니다`,
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "이미지 추가에 실패했습니다",
        variant: "destructive",
      });
    }
    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
    toast({
      title: "성공",
      description: "이미지가 제거되었습니다",
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "indoor",
      clientName: "",
      thumbnailUrl: "",
      completedDate: undefined,
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
                  <label className="block text-sm font-medium mb-2">썸네일 이미지 *</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("portfolio-thumbnail-upload")?.click()}
                        disabled={thumbnailUploading}
                      >
                        {thumbnailUploading ? "업로드 중..." : "이미지 선택"}
                      </Button>
                      <input
                        id="portfolio-thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </div>
                    {formData.thumbnailUrl && (
                      <img
                        src={formData.thumbnailUrl}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded border"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">프로젝트 목록에서 표시될 이미지입니다</p>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">추가 이미지들</label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-4"
                    onClick={() => document.getElementById("portfolio-images-upload")?.click()}
                  >
                    이미지 추가 (여러개 선택 가능)
                  </Button>
                  <input
                    id="portfolio-images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImages}
                    className="hidden"
                  />
                  
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                            onClick={() => handleRemoveImage(index)}
                            data-testid={`button-remove-image-${index}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <p className="text-xs text-muted-foreground text-center mt-1">{index + 1}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">포트폴리오 상세 페이지에서 표시될 이미지들입니다 ({formData.images?.length || 0}개)</p>
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
