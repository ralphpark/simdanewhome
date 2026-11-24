import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { insertMediaMentionSchema, type InsertMediaMention, type MediaMention } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const endpoint = "/api/media-mentions";
export const mediaMentionsQueryKey = [endpoint] as const;

type Change =
  | { method: "POST"; data: InsertMediaMention }
  | { method: "PATCH"; id: string; data: Partial<InsertMediaMention> }
  | { method: "DELETE"; id: string };

export function MediaMentionsTab({ query }: { query: UseQueryResult<MediaMention[]> }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<MediaMention | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) dateInput.current?.focus();
  }, [editing]);

  const mutation = useMutation({
    mutationFn: (change: Change) => {
      const url = "id" in change ? `${endpoint}/${encodeURIComponent(change.id)}` : endpoint;
      return apiRequest(change.method, url, "data" in change ? change.data : undefined);
    },
    onSuccess: async (_, change) => {
      if (change.method !== "DELETE" || change.id === editing?.id) {
        formRef.current?.reset();
        setEditing(null);
      }
      await queryClient.invalidateQueries({ queryKey: mediaMentionsQueryKey });
      toast({ title: change.method === "DELETE" ? "보도를 삭제했습니다" : "보도를 저장했습니다" });
    },
    onError: (_, change) => {
      toast({
        title: change.method === "DELETE" ? "보도를 삭제하지 못했습니다" : "보도를 저장하지 못했습니다",
        description: "목록과 연결 상태를 확인한 뒤 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = insertMediaMentionSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      toast({ title: result.error.issues[0].message, variant: "destructive" });
      return;
    }
    if (editing) {
      const changes: Partial<InsertMediaMention> = { ...result.data };
      for (const key of ["date", "outlet", "title", "url"] as const) {
        if (changes[key] === editing[key]) delete changes[key];
      }
      if (Object.keys(changes).length === 0) {
        setEditing(null);
        return;
      }
      mutation.mutate({ method: "PATCH", id: editing.id, data: changes });
    } else {
      mutation.mutate({ method: "POST", data: result.data });
    }
  }

  function remove(mention: MediaMention) {
    if (window.confirm(`‘${mention.title}’ 보도를 삭제할까요?`)) {
      mutation.mutate({ method: "DELETE", id: mention.id });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{editing ? "언론 보도 수정" : "언론 보도 추가"}</CardTitle></CardHeader>
        <CardContent>
          <form key={editing?.id ?? "new"} ref={formRef} onSubmit={save}>
            <fieldset disabled={mutation.isPending} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="media-date">날짜 (YYYY.MM)</Label>
                <Input ref={dateInput} id="media-date" name="date" defaultValue={editing?.date} placeholder="2023.11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="media-outlet">매체</Label>
                <Input id="media-outlet" name="outlet" defaultValue={editing?.outlet} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="media-title">제목</Label>
                <Input id="media-title" name="title" defaultValue={editing?.title} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="media-url">링크 (선택)</Label>
                <Input id="media-url" name="url" type="url" defaultValue={editing?.url ?? ""} placeholder="https://" />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editing ? "수정 저장" : "추가"}</Button>
                {editing && <Button type="button" variant="outline" onClick={() => setEditing(null)}>취소</Button>}
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>언론 보도 목록</CardTitle></CardHeader>
        <CardContent>
          {query.isPending && <p role="status">목록을 불러오는 중입니다.</p>}
          {query.isError && (
            <div role="alert" className="flex flex-wrap items-center gap-3">
              <p>목록을 불러오지 못했습니다.</p>
              <Button variant="outline" onClick={() => void query.refetch()}>다시 불러오기</Button>
            </div>
          )}
          {query.isSuccess && (query.data.length === 0 ? <p>등록된 언론 보도가 없습니다.</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead><TableHead>매체</TableHead><TableHead>제목</TableHead>
                  <TableHead>원문</TableHead><TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map(mention => (
                  <TableRow key={mention.id}>
                    <TableCell className="whitespace-nowrap">{mention.date}</TableCell>
                    <TableCell>{mention.outlet}</TableCell>
                    <TableCell>{mention.title}</TableCell>
                    <TableCell>{mention.url ? <a href={mention.url} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap underline">원문<span className="sr-only"> (새 창)</span></a> : "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => setEditing(mention)}>수정</Button>
                        <Button size="sm" variant="destructive" disabled={mutation.isPending} onClick={() => remove(mention)}>삭제</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
