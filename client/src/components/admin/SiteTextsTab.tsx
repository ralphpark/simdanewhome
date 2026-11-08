import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Eye, Search, Save } from "lucide-react";
import { siteTextKeys, siteTextPages, siteTexts, type SiteTextKey, type SiteTextPage } from "@/content/siteTexts";
import { renderSiteText, siteTextsQueryKey, useSiteTexts, type SiteTextOverride } from "@/components/site/SiteText";
import type { SiteTextDrafts } from "@/components/site/siteTextPreview";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SiteTextEditor } from "./SiteTextEditor";
import { SiteTextPreview } from "./SiteTextPreview";

const plain = (text: string) => text.replaceAll("**", "");
const leaveMessage = "저장하지 않은 변경이 있어요. 변경을 버리고 이동할까요?";

export function SiteTextsTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const { data, isLoading, isError, refetch } = useSiteTexts();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState<SiteTextPage>("home");
  const [drafts, setDrafts] = useState<SiteTextDrafts>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [focusedKey, setFocusedKey] = useState<SiteTextKey | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [jump, setJump] = useState<SiteTextKey | null>(null);
  const editorPane = useRef<HTMLDivElement>(null);
  const pending = siteTextKeys.filter(key => Object.hasOwn(drafts, key));
  const dirty = pending.length > 0;
  const savedValue = (key: SiteTextKey) => data?.find(row => row.key === key)?.value;
  const value = (key: SiteTextKey) => Object.hasOwn(drafts, key) ? drafts[key] ?? siteTexts[key].value : savedValue(key) ?? siteTexts[key].value;
  const invalid = pending.some(key => !value(key).trim() || value(key).length > 2000);
  const blocked = busy || isLoading || isError;
  const selectedPage = siteTextPages.find(item => item.id === page)!;
  const keys = siteTextKeys.filter(key => siteTexts[key].page === page);
  const sections = Array.from(new Set(keys.map(key => siteTexts[key].section)));
  const results = search.trim() ? siteTextKeys.filter(key => [value(key), siteTexts[key].value].some(text => plain(text).includes(search.trim()))) : [];

  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const change = () => { setDesktop(media.matches); if (media.matches) setSheet(false); };
    media.addEventListener("change", change); return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const leave = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest?.("a[href]");
      if (anchor instanceof HTMLAnchorElement && anchor.target !== "_blank" && !event.ctrlKey && !event.metaKey && !window.confirm(leaveMessage)) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", leave, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", leave, true); };
  }, [dirty]);
  useEffect(() => {
    if (!jump || sheet) return;
    const id = requestAnimationFrame(() => {
      const field = document.getElementById(`text-editor-${jump}`);
      const card = field?.closest<HTMLElement>("[data-text-card]");
      if (field && card) {
        card.scrollIntoView({ block: "nearest", behavior: "smooth" });
        field.focus({ preventScroll: true });
        setJump(null);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [jump, page, collapsed, sheet]);

  function focus(key: SiteTextKey) {
    setFocusedKey(key);
    setFocusRequest(previous => previous + 1);
  }
  function select(key: SiteTextKey) {
    setPage(siteTexts[key].page); setSearch(""); focus(key); setJump(key); setSheet(false);
    setCollapsed(previous => { const next = new Set(previous); next.delete(`${siteTexts[key].page}:${siteTexts[key].section}`); return next; });
  }
  function edit(key: SiteTextKey, nextValue: string | null) {
    setDrafts(previous => {
      const next = { ...previous };
      if (nextValue === null ? savedValue(key) === undefined : nextValue === (savedValue(key) ?? siteTexts[key].value)) delete next[key];
      else next[key] = nextValue;
      return next;
    });
  }
  async function saveAll() {
    if (blocked || invalid || !dirty) return;
    const changes = pending.map(key => ({ key, value: drafts[key] === null ? null : drafts[key]!.trim() }));
    setBusy(true);
    try {
      await apiRequest("PUT", "/api/site-texts", { changes });
      // Keep a successful save visible even if the following refresh is offline.
      queryClient.setQueryData<SiteTextOverride[]>(siteTextsQueryKey, previous => {
        const next = new Map((previous ?? []).map(row => [row.key, row]));
        changes.forEach(({ key, value }) => { if (value === null) next.delete(key); else next.set(key, { key, value, updatedAt: new Date().toISOString() }); });
        return Array.from(next.values());
      });
      setDrafts({});
      await queryClient.invalidateQueries({ queryKey: siteTextsQueryKey });
      setRevision(previous => previous + 1);
      toast({ title: "문구를 모두 저장했습니다", description: "사이트에 반영했어요. 열려 있던 사이트 화면은 새로고침하세요." });
    } catch {
      toast({ title: "저장하지 못했습니다", description: "변경 내용은 그대로 남아 있어요. 연결을 확인한 뒤 다시 시도해주세요.", variant: "destructive" });
    } finally { setBusy(false); }
  }
  const saveBar = dirty && <div data-text-savebar className="flex flex-wrap items-center justify-between gap-3 border-t bg-background px-4 py-3 shadow-lg">
    <p className="text-sm font-medium" role="status">저장하지 않은 변경 {pending.length}개</p>
    <div className="flex gap-2"><Button variant="outline" size="sm" disabled={busy} onClick={() => { setDrafts({}); }}>변경 취소</Button>
      <Button size="sm" disabled={blocked || invalid} onClick={() => void saveAll()}><Save className="mr-1 h-4 w-4" />{busy ? "저장 중…" : "모두 저장"}</Button></div>
    {invalid && <p className="w-full text-xs text-destructive">비어 있거나 너무 긴 문구를 확인해주세요.</p>}
  </div>;
  const preview = (mobile = false) => <SiteTextPreview path={selectedPage.path} drafts={drafts} focusedKey={focusedKey} focusRequest={focusRequest} revision={revision} mobile={mobile} onSelect={select} />;

  return <div className="space-y-4 pb-32" data-site-texts-admin>
    <style>{`.site-text-editor b,.site-text-editor strong{font-weight:700}.site-text-editor[data-em="grad"] b,.site-text-editor[data-em="grad"] strong{background:linear-gradient(110deg,#03473e 0%,#0e7a62 45%,#2fae86 100%);background-clip:text;-webkit-background-clip:text;color:transparent}`}</style>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">사이트 문구</h2><p className="mt-1 text-sm text-muted-foreground">글자를 선택해 강조하고, Enter로 줄을 바꿔보세요. 미리보기에서 바로 확인할 수 있어요.</p></div>
      {!desktop && <Button variant="outline" onClick={() => setSheet(true)}><Eye className="mr-2 h-4 w-4" />미리보기</Button>}</div>
    <div className="flex flex-wrap items-start gap-3">
      <Tabs value={page} onValueChange={next => { setPage(next as SiteTextPage); setFocusedKey(null); }} className="min-w-0 flex-1">
        <TabsList aria-label="문구를 볼 페이지" className="flex h-auto w-full flex-wrap justify-start gap-1">{siteTextPages.map(item => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}</TabsList>
      </Tabs>
      <div className="relative w-full lg:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="문구 찾기" placeholder="문구 찾기" value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setSearch(""); }} className="pl-9" />
        {search.trim() && <div className="absolute right-0 top-full z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-md border bg-background p-2 shadow-lg" aria-label="문구 찾기 결과">
          <p className="px-2 py-1 text-xs text-muted-foreground">{results.length ? `${results.length}개 문구를 찾았어요` : "찾는 문구가 없어요"}</p>
          {results.map(key => <button key={key} type="button" className="block w-full rounded p-2 text-left hover:bg-muted focus-visible:outline focus-visible:outline-2" onClick={() => select(key)}><span className="block text-xs text-muted-foreground">{siteTextPages.find(item => item.id === siteTexts[key].page)?.label} · {siteTexts[key].section} · {siteTexts[key].label}</span><span className="mt-1 block line-clamp-2 break-words text-sm">{plain(value(key))}</span></button>)}
        </div>}
      </div>
    </div>
    {isLoading && <p role="status" className="text-sm">문구를 불러오고 있어요.</p>}
    {isError && <div role="alert" className="flex flex-wrap items-center gap-3 rounded border p-3 text-sm"><p>저장된 문구를 불러오지 못했어요.</p><Button variant="outline" size="sm" onClick={() => void refetch()}>다시 불러오기</Button></div>}
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.4fr)]">
      <div ref={editorPane} className="min-w-0 space-y-3 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-2" data-text-edit-pane>
        <a className="inline-block text-sm underline underline-offset-4" href={selectedPage.path} target="_blank" rel="noopener noreferrer">사이트에서 보기 ↗</a>
        {sections.map(section => {
          const sectionId = `${page}:${section}`;
          return <Collapsible key={sectionId} open={!collapsed.has(sectionId)} onOpenChange={open => setCollapsed(previous => { const next = new Set(previous); if (open) next.delete(sectionId); else next.add(sectionId); return next; })} className="rounded-lg border bg-card">
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-lg p-4 text-left font-semibold"><span>{section}</span><ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${collapsed.has(sectionId) ? "-rotate-90" : ""}`} /></CollapsibleTrigger>
            <CollapsibleContent className="space-y-5 px-4 pb-4">{keys.filter(key => siteTexts[key].section === section).map(key => {
              const entry = siteTexts[key]; const current = value(key); const changed = current !== entry.value || savedValue(key) !== undefined && drafts[key] !== null;
              const error = !current.trim() ? "비워 둘 수 없어요. 원래대로 돌리려면 '원래 문구로'를 누르세요." : current.length > 2000 ? "문구는 2,000자까지 저장할 수 있어요." : "";
              const id = `text-editor-${key}`;
              return <div key={key} data-text-card={key} className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0" onClick={() => focus(key)}>
                <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor={id} className="text-sm font-medium">{entry.label}</label><div className="flex items-center gap-2">{Object.hasOwn(drafts, key) && <span className="h-2 w-2 rounded-full bg-amber-500" aria-label="저장하지 않은 변경" />}{changed && <Badge variant="secondary">고친 문구</Badge>}</div></div>
                <SiteTextEditor id={id} label={entry.label} value={current} em={entry.em} disabled={blocked} invalid={!!error} onChange={next => edit(key, next)} onFocus={() => focus(key)} />
                {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
                {plain(current).length > plain(entry.value).length * 1.5 && <p className="text-xs text-muted-foreground">원래보다 많이 길어요. 사이트에서 줄이 넘칠 수 있어요.</p>}
                {"previewHidden" in entry && entry.previewHidden && <p className="text-xs text-muted-foreground">이 문구는 미리보기에 바로 보이지 않아요(예: 접수 완료 화면).</p>}
                {changed && <div className="space-y-2"><Button variant="ghost" size="sm" disabled={blocked} onClick={() => edit(key, null)}>원래 문구로</Button><details className="text-xs text-muted-foreground"><summary className="cursor-pointer">원래 문구 보기</summary><p className="mt-2 break-words leading-relaxed">{renderSiteText(entry.value, entry.em)}</p></details></div>}
              </div>;
            })}</CollapsibleContent>
          </Collapsible>;
        })}
      </div>
      {desktop && <div className="sticky top-20 h-[calc(100vh-180px)] min-h-96 min-w-0">{preview()}</div>}
    </div>
    {!sheet && <div className="fixed inset-x-0 bottom-0 z-40">{saveBar}</div>}
    <Sheet open={sheet && !desktop} onOpenChange={setSheet}><SheetContent side="right" className="inset-0 flex h-[100dvh] w-full max-w-none flex-col gap-3 p-3 sm:max-w-none" onCloseAutoFocus={event => { if (jump) event.preventDefault(); }}>
      <SheetHeader className="pr-8 text-left"><SheetTitle>미리보기 · {selectedPage.label}</SheetTitle><SheetDescription>글자를 누르면 편집 칸으로 돌아가요.</SheetDescription></SheetHeader>
      <div className="min-h-0 flex-1">{preview(true)}</div>{saveBar}
    </SheetContent></Sheet>
  </div>;
}
