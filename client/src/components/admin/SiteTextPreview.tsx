import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteTexts, type SiteTextKey } from "@/content/siteTexts";
import type { SiteTextDrafts } from "@/components/site/siteTextPreview";

export function SiteTextPreview({ path, drafts, focusedKey, focusRequest, revision, mobile = false, onSelect }: {
  path: string; drafts: SiteTextDrafts; focusedKey: SiteTextKey | null; focusRequest: number; revision: number; mobile?: boolean; onSelect: (key: SiteTextKey) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState(mobile);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const latest = useRef({ drafts, focusedKey, onSelect });
  latest.current = { drafts, focusedKey, onSelect };
  const send = (message: unknown) => frame.current?.contentWindow?.postMessage(message, window.location.origin);
  const sync = () => {
    send({ type: "site-text-drafts", drafts: latest.current.drafts });
    if (latest.current.focusedKey) send({ type: "site-text-focus", key: latest.current.focusedKey });
  };
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "site-text-ready") sync();
      if (event.data?.type === "site-text-select" && typeof event.data.key === "string" && Object.hasOwn(siteTexts, event.data.key)) latest.current.onSelect(event.data.key);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => { send({ type: "site-text-drafts", drafts }); }, [drafts]);
  useEffect(() => { if (focusedKey) send({ type: "site-text-focus", key: focusedKey }); }, [focusedKey, focusRequest]);
  const width = phone ? 390 : 1440;
  const scale = size.width ? Math.min(1, size.width / width) : 1;
  return <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-muted/40" data-text-preview>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background p-2">
      <p className="text-sm font-medium">미리보기</p>
      <div className="flex gap-1"><Button size="sm" variant={phone ? "ghost" : "secondary"} aria-pressed={!phone} onClick={() => setPhone(false)}><Monitor className="mr-1 h-4 w-4" />데스크톱</Button>
        <Button size="sm" variant={phone ? "secondary" : "ghost"} aria-pressed={phone} onClick={() => setPhone(true)}><Smartphone className="mr-1 h-4 w-4" />모바일</Button></div>
    </div>
    <p className="border-b px-3 py-2 text-xs text-muted-foreground">사이트의 글자를 누르면 편집 칸에서 고칠 수 있어요.</p>
    <div ref={container} className="relative min-h-0 flex-1 overflow-hidden">
      <iframe ref={frame} key={`${path}:${revision}`} src={`${path}?textPreview=1`} title="사이트 문구 미리보기" onLoad={sync}
        className="absolute top-0 border-0 bg-white" style={{ width, height: size.height ? size.height / scale : 900, left: "50%", marginLeft: -width / 2, transform: `scale(${scale})`, transformOrigin: "top center" }} />
    </div>
  </div>;
}
