import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import type { Timeline, InsertTimeline } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function AdminTimelines() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [matchNew] = useRoute("/admin/timelines/new");
  const [matchEdit, params] = useRoute("/admin/timelines/:id");
  const routeId = params?.id && params.id !== "new" ? params.id : null;
  const isNewMode = !!matchNew;

  const [formData, setFormData] = useState<Partial<InsertTimeline>>({
    year: "",
    title: "",
    description: "",
  });

  const { data: timelines = [] } = useQuery<Timeline[]>({
    queryKey: ["/api/timelines"],
    enabled: isAuthenticated,
  });

  const { data: editingTimeline } = useQuery<Timeline>({
    queryKey: [`/api/timelines/${routeId}`],
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

  useEffect(() => {
    if (editingTimeline && routeId) {
      setFormData({
        year: editingTimeline.year,
        title: editingTimeline.title,
        description: editingTimeline.description,
      });
    }
  }, [editingTimeline, routeId]);

  const createTimelineMutation = useMutation({
    mutationFn: async (data: Partial<InsertTimeline>) => {
      const res = await apiRequest("POST", "/api/timelines", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelines"] });
      toast({
        title: "성공",
        description: "연혁 항목이 생성되었습니다",
      });
      sessionStorage.setItem('adminActiveTab', 'timelines');
      navigate("/admin");
    },
    onError: () => {
      toast({
        title: "오류",
        description: "연혁 항목 생성에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const updateTimelineMutation = useMutation({
    mutationFn: async (data: Partial<InsertTimeline>) => {
      const res = await apiRequest("PATCH", `/api/timelines/${routeId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timelines"] });
      queryClient.invalidateQueries({ queryKey: [`/api/timelines/${routeId}`] });
      toast({
        title: "성공",
        description: "연혁 항목이 수정되었습니다",
      });
      sessionStorage.setItem('adminActiveTab', 'timelines');
      navigate("/admin");
    },
    onError: () => {
      toast({
        title: "오류",
        description: "연혁 항목 수정에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year?.trim() || !formData.title?.trim() || !formData.description?.trim()) {
      toast({
        title: "오류",
        description: "모든 필드를 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      year: formData.year,
      title: formData.title,
      description: formData.description,
    };

    if (isNewMode) {
      createTimelineMutation.mutate(submitData);
    } else if (routeId) {
      updateTimelineMutation.mutate(submitData);
    }
  };

  if (!isAuthenticated && !authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/admin">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>
              {isNewMode ? "새 연혁 항목 추가" : "연혁 항목 수정"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">연도 (4자리)</label>
                <Input
                  value={formData.year || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, year: value });
                  }}
                  placeholder="예: 2017"
                  maxLength={4}
                  data-testid="input-year"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">제목</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 일산의 작은 식물가게 오픈"
                  data-testid="input-title"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">설명</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="예: 도시 생활 속 자연과의 연결을 위해 humble한 시작"
                  className="min-h-[120px]"
                  data-testid="textarea-description"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Link href="/admin">
                  <Button variant="outline">취소</Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createTimelineMutation.isPending || updateTimelineMutation.isPending}
                  data-testid="button-submit"
                >
                  {isNewMode ? "생성" : "수정"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
