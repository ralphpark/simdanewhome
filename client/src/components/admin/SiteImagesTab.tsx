import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useQueryClient } from "@tanstack/react-query";
import { siteImageKeys, defaultImages, type SiteImageKey } from "@/content/images";
import { siteImageContentTypes, siteImageMaxBytes } from "@shared/site-image-upload";
import { siteImagesQueryKey, useSiteImages, type SiteImageOverride } from "@/hooks/useSiteImage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandSpinner } from "@/components/site/SiteLoader";

function ImageCard({ imageKey, override, disabled }: { imageKey: SiteImageKey; override?: SiteImageOverride; disabled: boolean }) {
  const fallback = defaultImages[imageKey];
  const image = override ?? fallback;
  const [alt, setAlt] = useState(image.alt ?? fallback.alt);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  // Retain a completed upload when saving its DB reference fails, so retrying does
  // not upload (and bill for) the same file again.
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  useEffect(() => { setAlt(image.alt ?? fallback.alt); }, [image.alt, fallback.alt]);

  async function run(operation: () => Promise<void>, message: string) {
    setBusy(true);
    try {
      await operation();
      setPendingUrl(null);
      await queryClient.invalidateQueries({ queryKey: siteImagesQueryKey });
      toast({ title: message });
    } catch (error) {
      toast({ title: "저장하지 못했습니다", description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요", variant: "destructive" });
    } finally { setBusy(false); setProgress(null); }
  }

  async function save(url: string) { await apiRequest("PUT", `/api/site-images/${imageKey}`, { url, alt }); }

  function selectFile(file?: File) {
    if (!file) return;
    if (!siteImageContentTypes.includes(file.type) || file.size > siteImageMaxBytes || file.size === 0) {
      toast({ title: "파일을 확인해주세요", description: "JPG, PNG, WebP, GIF, AVIF 이미지 파일을 20MB 이하로 선택해주세요", variant: "destructive" });
      return;
    }
    void run(async () => {
      const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
      const blob = await upload(`site-images/${imageKey}/image.${extensions[file.type]}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        clientPayload: imageKey,
        contentType: file.type,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      setPendingUrl(blob.url);
      await save(blob.url);
    }, "사이트 이미지를 교체했습니다");
  }

  return (
    <Card aria-busy={busy}>
      <CardHeader><CardTitle className="text-base">{imageKey}</CardTitle><p className="text-xs text-muted-foreground">{override ? "관리자 이미지" : "기본 이미지"}</p></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-muted">
          {pendingUrl || image.url ? <img src={pendingUrl ?? image.url} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <p className="text-sm text-muted-foreground">기본 이미지 준비 중</p>}
        </div>
        <div className="space-y-2"><Label htmlFor={`alt-${imageKey}`}>이미지 설명</Label><Input id={`alt-${imageKey}`} value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={1000} disabled={busy || disabled} /></div>
        <div className="space-y-2"><Label htmlFor={`file-${imageKey}`}>이미지 교체</Label><Input id={`file-${imageKey}`} type="file" accept={siteImageContentTypes.join(",")} disabled={busy || disabled} onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ""; }} /></div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy || disabled || !(pendingUrl || override?.url)} onClick={() => void run(() => save(pendingUrl ?? override!.url), "이미지를 저장했습니다")}>{pendingUrl ? "저장 재시도" : "설명 저장"}</Button>
          <Button size="sm" variant="outline" disabled={busy || disabled || !override} onClick={() => void run(async () => { await apiRequest("DELETE", `/api/site-images/${imageKey}`); }, "기본 이미지로 되돌렸습니다")}>기본값으로</Button>
        </div>
        {pendingUrl && !busy && <p className="text-sm text-destructive">업로드는 완료됐지만 저장되지 않았습니다. 저장 재시도를 눌러주세요.</p>}
        {busy && <div role="status" className="flex items-center gap-2 text-sm"><BrandSpinner />{progress === null ? "저장 중…" : progress < 100 ? `업로드 ${progress}%` : "이미지 저장 중…"}</div>}
      </CardContent>
    </Card>
  );
}

export function SiteImagesTab() {
  const { data, isLoading, isError, refetch } = useSiteImages();
  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-semibold">사이트 이미지</h2><p className="mt-2 text-sm text-muted-foreground">JPG, PNG, WebP, GIF, AVIF · 최대 20MB. 기본값으로 되돌리면 사이트의 기본 이미지가 표시됩니다.</p></div>
      {isLoading && <BrandSpinner />}
      {isError && <div role="alert" className="flex flex-wrap items-center gap-4 rounded-md border p-4"><p>저장된 이미지를 불러오지 못했습니다. 연결을 확인해주세요.</p><Button variant="outline" onClick={() => void refetch()}>다시 불러오기</Button></div>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{siteImageKeys.map((key) => <ImageCard key={key} imageKey={key} override={data?.find((row) => row.key === key)} disabled={isLoading || isError} />)}</div>
    </div>
  );
}
