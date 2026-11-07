import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useQueryClient } from "@tanstack/react-query";
import { siteImageKeys, defaultImages, siteImageGuides, siteImagePageLabels, type SiteImageKey, type SiteImagePage } from "@/content/images";
import { siteImageContentTypes, siteImageMaxBytes } from "@shared/site-image-upload";
import { siteImagesQueryKey, useSiteImages, type SiteImageOverride } from "@/hooks/useSiteImage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandSpinner } from "@/components/site/SiteLoader";

function ImageCard({ imageKey, override, disabled }: { imageKey: SiteImageKey; override?: SiteImageOverride; disabled: boolean }) {
  const fallback = defaultImages[imageKey];
  const guide = siteImageGuides[imageKey];
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
    }, "사진을 바꿨습니다");
  }

  return (
    <Card aria-busy={busy}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3"><CardTitle className="text-base leading-snug">{guide.label}</CardTitle><Badge variant={override ? "default" : "outline"} className="shrink-0">{override ? "직접 올린 사진" : "임시 사진"}</Badge></div>
        <p className="text-sm text-muted-foreground">{guide.where}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Same ratio and object-cover as the site, so the crop matches what visitors see. */}
        <div className="flex items-center justify-center overflow-hidden rounded-md bg-muted" style={{ aspectRatio: guide.ratio }}>
          {pendingUrl || image.url ? <img src={pendingUrl ?? image.url} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <p className="text-sm text-muted-foreground">처음 사진 준비 중</p>}
        </div>
        <p className="text-xs text-muted-foreground">권장 비율 가로:세로 {guide.ratioLabel ?? guide.ratio.replace("/", ":")} · 권장 크기 {guide.size}</p>
        <div className="space-y-2"><Label htmlFor={`alt-${imageKey}`}>사진 설명</Label><Input id={`alt-${imageKey}`} value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={1000} disabled={busy || disabled} /></div>
        <div className="space-y-2"><Label htmlFor={`file-${imageKey}`}>사진 바꾸기</Label><Input id={`file-${imageKey}`} type="file" accept={siteImageContentTypes.join(",")} disabled={busy || disabled} onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ""; }} /></div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy || disabled || !(pendingUrl || override?.url)} onClick={() => void run(() => save(pendingUrl ?? override!.url), "사진을 저장했습니다")}>{pendingUrl ? "저장 재시도" : "설명 저장"}</Button>
          <Button size="sm" variant="outline" disabled={busy || disabled || !override} onClick={() => void run(async () => { await apiRequest("DELETE", `/api/site-images/${imageKey}`); }, "처음 사진으로 되돌렸습니다")}>기본값으로</Button>
        </div>
        {pendingUrl && !busy && <p className="text-sm text-destructive">업로드는 완료됐지만 저장되지 않았습니다. 저장 재시도를 눌러주세요.</p>}
        {busy && <div role="status" className="flex items-center gap-2 text-sm"><BrandSpinner />{progress === null ? "저장 중…" : progress < 100 ? `업로드 ${progress}%` : "사진 저장 중…"}</div>}
      </CardContent>
    </Card>
  );
}

const pages = Object.entries(siteImagePageLabels) as [SiteImagePage, string][];

export function SiteImagesTab() {
  const { data, isLoading, isError, refetch } = useSiteImages();
  return (
    <div className="space-y-6">
      <div className="space-y-1"><h2 className="text-xl font-semibold">사이트 사진</h2>
        <p className="pt-1 text-sm text-muted-foreground">페이지를 고르면 그 페이지에 나오는 사진만 보입니다. 미리보기는 가장 크게 쓰이는 곳의 비율을 따릅니다. 화면 크기와 스크롤 위치에 따라 잘리는 부분이 달라지니 중요한 부분은 가운데에 두세요.</p>
        <p className="text-sm text-muted-foreground">JPG, PNG, WebP, GIF, AVIF · 최대 20MB. 기본값으로 되돌리면 처음 사진이 다시 나옵니다.</p>
        <p className="text-sm text-muted-foreground">매거진 글의 사진은 '매거진' 탭, 포트폴리오 사진은 '포트폴리오' 탭에서 바꿉니다.</p>
      </div>
      {isLoading && <BrandSpinner />}
      {isError && <div role="alert" className="flex flex-wrap items-center gap-4 rounded-md border p-4"><p>저장된 사진을 불러오지 못했습니다. 연결을 확인해주세요.</p><Button variant="outline" onClick={() => void refetch()}>다시 불러오기</Button></div>}
      <Tabs defaultValue="home" className="space-y-6">
        <TabsList aria-label="사진을 볼 페이지" className="flex h-auto w-full flex-wrap justify-start gap-1">{pages.map(([page, label]) => <TabsTrigger key={page} value={page}>{label}</TabsTrigger>)}</TabsList>
        {/* forceMount keeps an in-flight upload (and its 저장 재시도 state) alive while another page is shown. */}
        {pages.map(([page]) => <TabsContent key={page} value={page} forceMount className="data-[state=inactive]:hidden">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{siteImageKeys.filter((key) => key.startsWith(`${page}.`)).map((key) => <ImageCard key={key} imageKey={key} override={data?.find((row) => row.key === key)} disabled={isLoading || isError} />)}</div>
        </TabsContent>)}
      </Tabs>
    </div>
  );
}
