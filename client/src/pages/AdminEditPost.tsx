import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Post, InsertPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeft, Save, Bold, Italic, Heading2, List, Image as ImageIcon, Link2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";

interface EditPostParams {
  id?: string;
}

export default function AdminEditPost({ id }: EditPostParams) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<Partial<InsertPost>>({
    title: "",
    content: "",
    excerpt: "",
    category: "plant-care",
    tags: [],
    author: "simda Team",
    published: true,
    thumbnailUrl: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  // Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        allowBase64: true,
      }),
    ],
    content: formData.content || "<p>포스트 내용을 입력하세요...</p>",
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, content: editor.getHTML() });
    },
  });

  // Fetch post if editing
  const { data: post, isLoading: postLoading } = useQuery<Post>({
    queryKey: [`/api/posts/${id}`],
    enabled: isEditMode && isAuthenticated,
  });

  useEffect(() => {
    if (post && isEditMode) {
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category,
        tags: post.tags || [],
        author: post.author,
        published: post.published,
        thumbnailUrl: post.thumbnailUrl,
      });
      editor?.commands.setContent(post.content);
    }
  }, [post, isEditMode, editor]);

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

  const createPostMutation = useMutation({
    mutationFn: async (data: Partial<InsertPost>) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({
        title: "성공",
        description: "포스트가 생성되었습니다",
      });
      navigate("/admin");
    },
    onError: () => {
      toast({
        title: "오류",
        description: "포스트 생성에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: Partial<InsertPost>) => {
      const res = await apiRequest("PATCH", `/api/posts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}`] });
      toast({
        title: "성공",
        description: "포스트가 수정되었습니다",
      });
      navigate("/admin");
    },
    onError: () => {
      toast({
        title: "오류",
        description: "포스트 수정에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        editor?.chain().focus().setImage({ src: url }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        // 파일명 생성
        const fileName = `thumbnails/${Date.now()}-${file.name}`;
        // 데이터 URL을 사용 (실제 프로덕션에서는 서버에서 처리)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.excerpt || !formData.thumbnailUrl) {
      toast({
        title: "필수 항목",
        description: "모든 필수 항목을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (isEditMode) {
      updatePostMutation.mutate(formData);
    } else {
      createPostMutation.mutate(formData);
    }
  };

  if (authLoading || postLoading) {
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "포스트 수정" : "새 포스트 작성"}</CardTitle>
            <CardDescription>
              {isEditMode ? "기존 포스트를 수정하세요" : "새로운 블로그 포스트를 작성하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="포스트 제목을 입력하세요"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title?.length || 0}/200
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2">요약 *</label>
                <Textarea
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="포스트 한 줄 요약 (목록에서 표시됩니다)"
                  maxLength={300}
                  className="resize-none h-20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.excerpt?.length || 0}/300
                </p>
              </div>

              {/* Thumbnail Image */}
              <div>
                <label className="block text-sm font-medium mb-2">썸네일 이미지 *</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById("thumbnail-upload")?.click()}
                      disabled={thumbnailUploading}
                    >
                      {thumbnailUploading ? "업로드 중..." : "이미지 선택"}
                    </Button>
                    <input
                      id="thumbnail-upload"
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
                <p className="text-xs text-muted-foreground mt-2">포스트 목록에서 표시될 이미지입니다 (권장: 1200x800px)</p>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">내용 *</label>
                <div className="border rounded-lg">
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-1 p-3 border-b bg-muted">
                    <Button
                      type="button"
                      size="icon"
                      variant={editor?.isActive("bold") ? "default" : "ghost"}
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className="h-8 w-8"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={editor?.isActive("italic") ? "default" : "ghost"}
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className="h-8 w-8"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={editor?.isActive("heading", { level: 2 }) ? "default" : "ghost"}
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className="h-8 w-8"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={editor?.isActive("bulletList") ? "default" : "ghost"}
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className="h-8 w-8"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <div className="border-l mx-1"></div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="h-8 w-8"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Editor */}
                  <div className="prose prose-sm max-w-none p-4 min-h-96 focus:outline-none">
                    <EditorContent editor={editor} className="focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <select
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="plant-care">식물 관리</option>
                  <option value="design">인테리어</option>
                  <option value="trends">트렌드</option>
                  <option value="story">스토리</option>
                  <option value="other">기타</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">태그</label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="태그 입력 후 엔터"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    추가
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium mb-2">작성자</label>
                <Input
                  value={formData.author || ""}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="작성자 이름"
                />
              </div>

              {/* Publish Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published || false}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                  발행 상태 (체크 시 공개)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Link href="/admin">
                  <Button type="button" variant="outline">
                    취소
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isEditMode ? "수정 완료" : "포스트 생성"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
